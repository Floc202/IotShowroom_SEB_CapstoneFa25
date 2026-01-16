import { useCallback, useEffect, useState } from "react";
import { Empty, Modal } from "antd";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { listSemesters } from "../../api/semesters";
import {
  searchClasses,
  deleteClass,
  createClass,
  updateClass,
  getClassById,
  changeClassStatus,
} from "../../api/classes";
import { getUsersByRole } from "../../api/users";
import type { Semester } from "../../types/semesters";
import type {
  ClassItem,
  CreateClassRequest,
  UpdateClassRequest,
} from "../../types/classes";
import type { SimpleUser } from "../../types/users";
import { getErrorMessage } from "../../utils/helpers";

import ClassSearch from "../../components/classes/ClassSearch";
import ClassesTable from "../../components/classes/ClassesTable";
import ClassUpsertModal from "../../components/classes/ClassUpsertModal";
import GraderManagementModal from "../../components/admin/GraderManagementModal";

export default function ClassManagement() {
  const navigate = useNavigate();

  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [upsertOpen, setUpsertOpen] = useState(false);
  const [editing, setEditing] = useState<ClassItem | null>(null);
  const [instructors, setInstructors] = useState<SimpleUser[]>([]);
  const [graderModalOpen, setGraderModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);

  const fetchSemesters = useCallback(async () => {
    try {
      const res = await listSemesters();
      setSemesters(res.data || []);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  }, []);

  const loadInstructors = useCallback(async () => {
    try {
      const res = await getUsersByRole(2); 
      setInstructors(
        (res.data || []).map((u) => ({
          userId: u.userId,
          fullName: u.fullName,
          email: u.email,
        }))
      );
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  }, []);

  const doSearch = useCallback(
    async (params?: { q?: string; semesterId?: number }) => {
      try {
        setLoading(true);
        const res = await searchClasses(params);
        setClasses(res.data || []);
      } catch (e) {
        toast.error(getErrorMessage(e));
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchSemesters();
    loadInstructors();
    doSearch();
  }, [fetchSemesters, doSearch, loadInstructors]);

  const handleView = (id: number) => navigate(`/admin/classes/${id}`);

  const handleEdit = async (record: ClassItem) => {
    try {
      setLoading(true);
      const res = await getClassById(record.classId);
      const item = res.data || record;
      setEditing(item);
      setUpsertOpen(true);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (record: ClassItem) => {
    try {
      const res = await deleteClass(record.classId);
      if (!res.isSuccess) return toast.error(res.message || "Delete failed");
      setClasses((prev) => prev.filter((c) => c.classId !== record.classId));
      toast.success(`Deleted "${record.className}"`);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const openCreate = () => {
    setEditing(null);
    setUpsertOpen(true);
  };

  const submitUpsert = async (
    payload: CreateClassRequest | UpdateClassRequest
  ) => {
    try {
      setLoading(true);
      if (editing) {
        const res = await updateClass(
          editing.classId,
          payload as UpdateClassRequest
        );
        if (!res.isSuccess) return toast.error(res.message || "Update failed");
        const updated = res.data!;
        setClasses((prev) =>
          prev.map((c) => (c.classId === updated.classId ? updated : c))
        );
        toast.success("Class updated");
      } else {
        const res = await createClass(payload as CreateClassRequest);
        if (!res.isSuccess) return toast.error(res.message || "Create failed");
        setClasses((prev) => [res.data!, ...prev]);
        toast.success("Class created");
      }
      setUpsertOpen(false);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const handleChangeStatus = async (
    classItem: ClassItem,
    newStatus: ClassItem["status"]
  ) => {
    try {
      const res = await changeClassStatus(classItem.classId, { status: newStatus });
      
      if (!res.isSuccess) {
        if (res.responseCode === "STUDENTS_WITHOUT_GROUP" && res.data) {
          const warnings = res.data.warnings || [];
          Modal.error({
            title: "Cannot Change Status",
            content: (
              <div className="space-y-3">
                <p className="text-gray-700">{res.message}</p>
                {warnings.length > 0 && (
                  <div>
                    <p className="font-semibold mb-2">Students without group:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      {warnings.map((studentName, index) => (
                        <li key={index} className="text-gray-600">
                          {studentName}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ),
            width: 500,
          });
        } else {
          toast.error(res.message || "Status change failed");
        }
        return;
      }

      await doSearch();
      toast.success(`Status changed to "${newStatus}"`);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Class Management</h1>
        <p className="text-gray-600 mt-2">
          Search and manage classes across semesters
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-8">
        <ClassSearch
          semesters={semesters}
          loading={loading}
          onSearch={doSearch}
          onRefresh={() => doSearch()}
          onCreate={openCreate}
        />

        <>
          {classes.length === 0 ? (
            <Empty description="No classes found" />
          ) : (
            <ClassesTable
              data={classes}
              loading={loading}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onManageGraders={(classItem) => {
                setSelectedClass(classItem);
                setGraderModalOpen(true);
              }}
              onChangeStatus={handleChangeStatus}
            />
          )}
        </>
      </div>

      <ClassUpsertModal
        open={upsertOpen}
        onClose={() => setUpsertOpen(false)}
        onSubmit={submitUpsert}
        semesters={semesters}
        instructors={instructors}
        editing={editing || undefined}
      />

      {selectedClass && (
        <GraderManagementModal
          open={graderModalOpen}
          classId={selectedClass.classId}
          className={selectedClass.className}
          instructorId={selectedClass.instructorId}
          onClose={() => {
            setGraderModalOpen(false);
            setSelectedClass(null);
          }}
        />
      )}
    </div>
  );
}
