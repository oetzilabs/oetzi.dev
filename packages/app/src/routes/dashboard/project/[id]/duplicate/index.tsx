import { useParams } from "solid-start";
import DuplicateProject from "../../../../../components/DuplicateProject";

const DuplicateProjectPage = () => {
  const { id } = useParams<{ id: string }>();
  return (
    <div class="container mx-auto flex flex-col gap-4 py-10">
      <h1 class="text-3xl font-bold">Duplicate Project</h1>
      <DuplicateProject projectId={id} />
    </div>
  );
};
export default DuplicateProjectPage;
