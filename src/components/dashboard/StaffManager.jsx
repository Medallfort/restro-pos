import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { useSelector } from "react-redux";
import { getErrorMessage, getUsers, updateUserRole } from "../../https";
import { ROLES } from "../../constants";

const StaffManager = () => {
  const queryClient = useQueryClient();
  const currentUserId = useSelector((state) => state.user._id);
  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
    select: (res) => res.data.data,
  });

  const mutation = useMutation({
    mutationFn: updateUserRole,
    onSuccess: (res) => {
      enqueueSnackbar(res.data.message, { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => enqueueSnackbar(getErrorMessage(error), { variant: "error" }),
  });

  return (
    <div className="container mx-auto bg-[#262626] p-4 rounded-lg">
      <h2 className="text-[#f5f5f5] text-xl font-semibold mb-1">Users</h2>
      <p className="text-sm text-[#ababab] mb-4">New sign-ups are Clients. To add a waiter or cashier, change their role here.</p>
      <table className="w-full text-left text-[#f5f5f5]">
        <thead className="bg-[#333] text-[#ababab]">
          <tr>
            <th className="p-3">Name</th>
            <th className="p-3">Email</th>
            <th className="p-3">Phone</th>
            <th className="p-3">Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id} className="border-b border-gray-600 hover:bg-[#333]">
              <td className="p-4">{user.name}</td>
              <td className="p-4">{user.email}</td>
              <td className="p-4">{user.phone}</td>
              <td className="p-4">
                {user._id === currentUserId ? (
                  <span className="text-[#ababab]">{user.role} (you)</span>
                ) : (
                  <select
                    value={user.role}
                    disabled={mutation.isPending}
                    onChange={(e) => mutation.mutate({ userId: user._id, role: e.target.value })}
                    className="bg-[#1a1a1a] text-[#f5f5f5] border border-gray-500 p-2 rounded-lg focus:outline-none"
                  >
                    {ROLES.map((role) => <option key={role} value={role}>{role}</option>)}
                  </select>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StaffManager;
