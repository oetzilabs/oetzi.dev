import { Project } from "@oetzidev/core/entities/projects";
import { User } from "@oetzidev/core/entities/users";
import Dexie from "dexie";

export class IDB extends Dexie {
  eventListener: Record<string, Record<string, () => void>> = {};

  createProjects: Dexie.Table<Parameters<typeof Project.create>[1], number>;
  projects: Dexie.Table<NonNullable<User.Frontend>["projects"][number], number>;
  sessions: Dexie.Table<ISession, number>;

  constructor(dbName: string) {
    super(dbName);

    // Define tables and indexes
    this.version(1).stores({
      projects: "++id, name, description, ownerId, createdAt, deletedAt, remote, visibility, protected, stack, stackId",
      sessions: "++id, token, user",
      createProjects:
        "++id, name, description, ownerId, createdAt, deletedAt, remote, visibility, protected, stack, stackId",
    });

    // Define table types
    this.projects = this.table("projects");
    this.sessions = this.table("sessions");
    this.createProjects = this.table("createProjects");
  }
}

interface ISession {
  id?: number;
  token: string;
  user: string;
}
