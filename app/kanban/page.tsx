import { ClockIcon } from "@radix-ui/react-icons";
import KanbanBoard from "./KanbanBoard";

export default function KanbanPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="border-b pb-5 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <ClockIcon className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Issue Tracking
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage and track project issues in real-time
              </p>
            </div>
          </div>
        </div>
      </div>
      <KanbanBoard />
    </div>
  );
}
