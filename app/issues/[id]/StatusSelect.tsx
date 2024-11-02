"use client";

import { Issue } from "@prisma/client";
import { Select } from "@radix-ui/themes";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";

const StatusSelect = ({ issue }: { issue: Issue }) => {
  const router = useRouter();

  const Data = [
    { id: "OPEN", value: "OPEN" },
    { id: "IN_PROGRESS", value: "IN_PROGRESS" },
    { id: "CLOSED", value: "CLOSED" },
  ];

  const statuschange = async (status: string) => {
    try {
      await axios.patch("/api/issues/" + issue.id, {
        status: status || "OPEN",
      });
      router.refresh();
      toast.success("Status updated successfully!");
    } catch (error) {
      toast.error("Changes could not be saved.");
    }
  };

  return (
    <>
      <Select.Root
        defaultValue={issue.status || ""}
        onValueChange={statuschange}
      >
        <Select.Trigger />
        <Select.Content>
          <Select.Group>
            <Select.Label>Status</Select.Label>
            {Data?.map((Data) => (
              <Select.Item key={Data.id} value={Data.value}>
                {Data.value}
              </Select.Item>
            ))}
          </Select.Group>
        </Select.Content>
      </Select.Root>
      <Toaster />
    </>
  );
};

export default StatusSelect;
