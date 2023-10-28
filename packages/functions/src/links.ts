import { ApiHandler, useFormData, usePathParams, useQueryParams } from "sst/node/api";
import { Link } from "@oetzidev/core/entities/links";
import { StatusCodes } from "http-status-codes";
import { getUser } from "./utils";
import { load } from "cheerio";

export const handler = ApiHandler(async (_event) => {
  const { element } = usePathParams();
  const sp = useQueryParams();
  const type = sp.type;
  if (!type || !element)
    return {
      statusCode: StatusCodes.BAD_REQUEST,
      body: JSON.stringify({
        error: "Missing parameters",
      }),
    };
  const link = await Link.findByGroupAndType(element, type);
  if (!link)
    return {
      statusCode: 404,
      body: JSON.stringify({
        error: "No link found",
      }),
    };

  const url = `${link.url}?${new URLSearchParams({ ref: "oetzi.dev" })}`;
  return {
    statusCode: 302,
    headers: {
      Location: url,
    },
  };
});

export const all = ApiHandler(async (_event) => {
  const [user] = await getUser();
  if (!user)
    return {
      statusCode: StatusCodes.UNAUTHORIZED,
      body: JSON.stringify({
        error: "Unauthorized",
      }),
    };
  const links = await Link.all();
  return {
    statusCode: 200,
    body: JSON.stringify(links),
  };
});

export const create = ApiHandler(async (_event) => {
  const [user] = await getUser();
  if (!user)
    return {
      statusCode: StatusCodes.UNAUTHORIZED,
      body: JSON.stringify({
        error: "Unauthorized",
      }),
    };
  const linkData = useFormData();
  if (!linkData) {
    return {
      statusCode: StatusCodes.BAD_REQUEST,
      body: JSON.stringify({
        error: "Bad Request. No form data",
      }),
    };
  }
  const ldata = Object.fromEntries(linkData.entries());
  const linkParsed = Link.safeParseForCreate(ldata);
  if (!linkParsed.success) {
    return {
      statusCode: StatusCodes.BAD_REQUEST,
      body: JSON.stringify({
        error: "Bad Request. No link data:" + linkParsed.error.message,
      }),
    };
  }
  const url = linkParsed.data.url;
  // call url to get meta data
  const calledPage = await fetch(url).then((r) => r.text());

  const meta = load(calledPage);
  const metaTags = meta("meta").toArray();
  let metas = [];
  for (const metaTag of metaTags) {
    const meta = metaTag.attribs;
    if (meta.name && meta.content) {
      metas.push({
        name: meta.name,
        content: meta.content,
      });
    }
  }

  const link = await Link.create({
    ...linkParsed.data,
    meta: metas,
  });

  return {
    statusCode: 200,
    body: JSON.stringify(link),
  };
});

export const update = ApiHandler(async (_event) => {
  const [user] = await getUser();
  if (!user)
    return {
      statusCode: StatusCodes.UNAUTHORIZED,
      body: JSON.stringify({
        error: "Unauthorized",
      }),
    };
  const linkData = useFormData();
  if (!linkData) {
    return {
      statusCode: StatusCodes.BAD_REQUEST,
      body: JSON.stringify({
        error: "Bad Request. No form data",
      }),
    };
  }
  const id = linkData.get("id");
  if (!id) {
    return {
      statusCode: StatusCodes.BAD_REQUEST,
      body: JSON.stringify({
        error: "Bad Request. No id",
      }),
    };
  }
  const ldata = Object.fromEntries(linkData.entries());
  const linkParsed = Link.safeParse(ldata);
  if (!linkParsed.success) {
    return {
      statusCode: StatusCodes.BAD_REQUEST,
      body: JSON.stringify({
        error: "Bad Request. No link data:" + linkParsed.error.message,
      }),
    };
  }
  const link = await Link.update(id, {
    ...linkParsed.data,
  });

  return {
    statusCode: 200,
    body: JSON.stringify(link),
  };
});

export const remove = ApiHandler(async (_event) => {
  const [user] = await getUser();
  if (!user)
    return {
      statusCode: StatusCodes.UNAUTHORIZED,
      body: JSON.stringify({
        error: "Unauthorized",
      }),
    };
  const linkData = useFormData();
  if (!linkData) {
    return {
      statusCode: StatusCodes.BAD_REQUEST,
      body: JSON.stringify({
        error: "Bad Request",
      }),
    };
  }
  const id = linkData.get("id");
  if (!id) {
    return {
      statusCode: StatusCodes.BAD_REQUEST,
      body: JSON.stringify({
        error: "Bad Request",
      }),
    };
  }
  const link = await Link.remove(id);

  return {
    statusCode: 200,
    body: JSON.stringify(link),
  };
});
