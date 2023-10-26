import { createQuery } from "@tanstack/solid-query";
import { useAuth } from "../../../components/providers/OfflineFirst";
import { CreateStack } from "../../../components/CreateStack";
import { Queries } from "../../../utils/api/queries";

const CreateTemplatePage = () => {
  const [user] = useAuth();

  const stacks = createQuery(
    () => ["user_stacks"],
    () => {
      const u = user();
      if (!u.isAuthenticated) return Promise.reject("You are not logged in.");
      const token = u.token;
      if (!token) return Promise.reject("You are not logged in.");
      return Queries.userStacks(token);
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
      <CreateStack stacks={stacks.data ?? []} />
    </div>
  );
};

export default CreateTemplatePage;
