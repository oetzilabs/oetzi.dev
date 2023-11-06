import { useParams } from "solid-start";
import { ConfigureProjectConstructs } from "../../../../components/ConfigureProjectConstructs";

const ConfigureProjectPage = () => {
  const { id } = useParams<{ id: string }>();
  return (
    <div class="container mx-auto flex flex-col gap-4 py-10">
      <h1 class="text-3xl font-bold">Configure Constructs for Project</h1>
      <ConfigureProjectConstructs projectId={id} />
    </div>
  );
};

export default ConfigureProjectPage;
