import { createQuery } from "@tanstack/solid-query";
import { useAuth } from "../../../components/Auth";
import { CreateTemplate } from "../../../components/CreateTemplate";
import { Queries } from "../../../utils/api/queries";

const CreateTemplatePage = () => {
  const [user] = useAuth();

  const templates = createQuery(
    () => ["user_templates"],
    () => {
      const u = user();
      if (!u.isAuthenticated) return Promise.reject("You are not logged in.");
      const token = u.token;
      if (!token) return Promise.reject("You are not logged in.");
      return Queries.userTemplates(token);
    },
    {
      get enabled() {
        const u = user();
        return u.isAuthenticated && !!u.token;
      },
    }
  );

  return (
    <div class="container mx-auto flex flex-col gap-4">
      <CreateTemplate templates={templates.data ?? []} />
    </div>
  );
};

export default CreateTemplatePage;
