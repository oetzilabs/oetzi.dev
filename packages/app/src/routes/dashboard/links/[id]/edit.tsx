import { useParams } from "solid-start";
import { EditLink } from "../../../../components/EditLink";

export default function EditLinkPage() {
  const { id } = useParams();
  return <EditLink id={id} />;
}
