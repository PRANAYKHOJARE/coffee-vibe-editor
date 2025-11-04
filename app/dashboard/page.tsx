import {
  getAllPlaygroundForUser,
  duplicateProjectById,
  deleteProjectById,
  editProjectById, // ✅ Added
} from "@/modules/dashboard/actions";
import AddNewButton from "@/modules/dashboard/components/add-new";
import AddRepo from "@/modules/dashboard/components/add-repo";
import EmptyState from "@/modules/dashboard/components/empty-state";
import ProjectTable from "@/modules/dashboard/components/project-table";
import { Project } from "@/modules/dashboard/types";
import { revalidatePath } from "next/cache";

// ✅ Server Component
const Page = async () => {
  const playgrounds = await getAllPlaygroundForUser();

  // ✅ Shape data safely
  const safeProjects: Project[] = (playgrounds || []).map((p: any) => ({
    ...p,
    Starmark: p?.Starmark ?? false,
    description: p?.description ?? "",
  }));

  // ✅ Define server actions
  async function handleDuplicateProject(id: string) {
    "use server";
    await duplicateProjectById(id);
    revalidatePath("/dashboard");
  }

  async function handleDeleteProject(id: string) {
    "use server";
    await deleteProjectById(id);
    revalidatePath("/dashboard");
  }

  async function handleEditProject(
    id: string,
    data: { title: string; description: string }
  ) {
    "use server";
    await editProjectById(id, data);
    revalidatePath("/dashboard");
  }

  return (
    <div className="flex flex-col justify-start items-center min-h-screen mx-auto max-w-7xl px-4 py-10">
      {/* ✅ Top Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <AddNewButton />
        <AddRepo />
      </div>

      {/* ✅ Project Table */}
      <div className="mt-10 flex flex-col justify-center items-center w-full">
        {safeProjects.length === 0 ? (
          <EmptyState />
        ) : (
          <ProjectTable
            projects={safeProjects}
            onDuplicateProject={handleDuplicateProject}
            onDeleteProject={handleDeleteProject}
            onEditProject={handleEditProject} // ✅ Added prop
          />
        )}
      </div>
    </div>
  );
};

export default Page;
