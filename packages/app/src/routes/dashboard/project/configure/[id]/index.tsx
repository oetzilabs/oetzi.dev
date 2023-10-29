import { useParams } from "solid-start";
import { ConfigureProject } from "../../../../../components/ConfigureProject";

const ConfigureProjectPage = () => {
  const { id } = useParams<{ id: string }>();
  return (
    <div class="container mx-auto flex flex-col gap-4 py-10">
      <h1 class="text-3xl font-bold">Configure Project</h1>
      <ConfigureProject projectId={id} />
    </div>
  );
};

export default ConfigureProjectPage;
