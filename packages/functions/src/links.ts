import { ApiHandler, useFormData, usePathParams, useQueryParams } from "sst/node/api";
import { Link } from "@oetzidev/core/entities/links";
import { StatusCodes } from "http-status-codes";
import { getUser } from "./utils";
import { load } from "cheerio";
import { SolidStartSite } from "sst/node/site";

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
      statusCode: 302,
      headers: {
        Location: "https://oetzi.dev/404",
      },
    };
  if (!link.active) {
    return {
      statusCode: 302,
      headers: {
        Location: "https://oetzi.dev/404",
      },
    };
  }

  const url = `${link.url}?${new URLSearchParams({ ref: "oetzi.dev" })}`;
  return {
    statusCode: 302,
    headers: {
      Location: url,
    },
  };
});

export const get = ApiHandler(async (_event) => {
  const [user] = await getUser();
  const sp = useQueryParams();
  const id = sp.id;
  if (!id)
    return {
      statusCode: StatusCodes.BAD_REQUEST,
      body: JSON.stringify({
        error: "Missing parameters",
      }),
    };
  if (!user)
    return {
      statusCode: StatusCodes.UNAUTHORIZED,
      body: JSON.stringify({
        error: "Unauthorized",
      }),
    };
  const links = await Link.findById(id);
  if (!links) {
    return {
      statusCode: StatusCodes.NOT_FOUND,
      body: JSON.stringify({
        error: `Link with id '${id}' not found`,
      }),
    };
  }
  return {
    statusCode: 200,
    body: JSON.stringify(links),
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
  let actualLdata: any = ldata;
  if (ldata.active === "true") {
    actualLdata.active = true;
  } else {
    actualLdata.active = false;
  }
  const linkParsed = Link.safeParseForCreate(actualLdata);
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
  let metas: Array<{
    name: string;
    content: string;
  }> = [];
  for (const metaTag of metaTags) {
    const metaA = metaTag.attribs;
    if (metaA.name && metaA.content) {
      metas.push({
        name: metaA.name,
        content: metaA.content,
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
  let actualLdata: any = ldata;
  if (ldata.active === "true") {
    actualLdata.active = true;
  } else {
    actualLdata.active = false;
  }
  const linkParsed = Link.safeParseForUpdate(actualLdata);

  if (!linkParsed.success) {
    return {
      statusCode: StatusCodes.BAD_REQUEST,
      body: JSON.stringify({
        error: "Bad Request. No link data:" + linkParsed.error.message,
      }),
    };
  }
  const oldLink = await Link.findById(id);
  let meta: Array<{
    name: string;
    content: string;
  }> = oldLink?.meta || [];

  const url = linkParsed.data.url;
  if (url) {
    // call url to get meta data
    const calledPage = await fetch(url).then((r) => r.text());

    const metaTags = load(calledPage)("meta").toArray();

    for (const metaTag of metaTags) {
      const metaA = metaTag.attribs;
      if (metaA.name && metaA.content && !meta.find((m) => m.name === metaA.name)) {
        meta.push({
          name: metaA.name,
          content: metaA.content,
        });
      }
    }
  }

  const link = await Link.update(id, {
    ...linkParsed.data,
    meta,
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
