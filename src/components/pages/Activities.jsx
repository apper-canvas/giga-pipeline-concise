import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Header from "@/components/organisms/Header";
import ActivityCard from "@/components/molecules/ActivityCard";
import ActivityForm from "@/components/molecules/ActivityForm";
import Modal from "@/components/atoms/Modal";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { activitiesService } from "@/services/api/activitiesService";
import { contactsService } from "@/services/api/contactsService";
import { dealsService } from "@/services/api/dealsService";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [deletingActivity, setDeletingActivity] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [activitiesData, contactsData, dealsData] = await Promise.all([
        activitiesService.getAll(),
        contactsService.getAll(),
        dealsService.getAll()
      ]);
      setActivities(activitiesData || []);
      setContacts(contactsData || []);
      setDeals(dealsData || []);
    } catch (err) {
      console.error("Error loading data:", err);
      setError(err.message || "Failed to load activities");
    } finally {
      setLoading(false);
    }
  };

  const handleAddActivity = () => {
    setEditingActivity(null);
    setShowActivityForm(true);
  };

  const handleEditActivity = (activity) => {
    setEditingActivity(activity);
    setShowActivityForm(true);
  };

  const handleDeleteActivity = (activity) => {
    setDeletingActivity(activity);
  };

  const handleSaveActivity = async (activityData) => {
    try {
      if (editingActivity) {
        await activitiesService.update(editingActivity.Id, activityData);
        toast.success("Activity updated successfully");
      } else {
        await activitiesService.create(activityData);
        toast.success("Activity created successfully");
      }
      setShowActivityForm(false);
      setEditingActivity(null);
      await loadData();
    } catch (err) {
      console.error("Error saving activity:", err);
      toast.error(err.message || "Failed to save activity");
      throw err;
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingActivity) return;

    try {
      await activitiesService.delete(deletingActivity.Id);
      toast.success("Activity deleted successfully");
      setDeletingActivity(null);
      await loadData();
    } catch (err) {
      console.error("Error deleting activity:", err);
      toast.error(err.message || "Failed to delete activity");
    }
  };

  const filteredActivities = activities.filter((activity) => {
    const matchesSearch = activity.description_c
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || activity.type_c === typeFilter;
    return matchesSearch && matchesType;
  });

  const sortedActivities = [...filteredActivities].sort(
    (a, b) => new Date(b.date_c) - new Date(a.date_c)
  );

  const activityTypes = [
    { value: "all", label: "All Types" },
    { value: "call", label: "Call" },
    { value: "email", label: "Email" },
    { value: "meeting", label: "Meeting" },
    { value: "note", label: "Note" },
    { value: "task", label: "Task" }
  ];

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadData} />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onSearch={setSearchTerm}
        searchValue={searchTerm}
        onAddContact={null}
        onAddDeal={null}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Activities</h1>
            <p className="mt-2 text-sm text-gray-600">
              Track all interactions with contacts and deals
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button
              variant="primary"
              onClick={handleAddActivity}
              className="w-full sm:w-auto"
            >
              <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
              Add Activity
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Type
              </label>
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                options={activityTypes}
              />
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setTypeFilter("all");
                  setSearchTerm("");
                }}
              >
                <ApperIcon name="X" className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Activities List */}
        {sortedActivities.length === 0 ? (
          <Empty
            icon="Activity"
            title="No activities found"
            description={
              searchTerm || typeFilter !== "all"
                ? "Try adjusting your filters"
                : "Get started by adding your first activity"
            }
            action={
              <Button variant="primary" onClick={handleAddActivity}>
                <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
                Add Activity
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence mode="popLayout">
              {sortedActivities.map((activity) => (
                <motion.div
                  key={activity.Id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <ActivityCard
                    activity={activity}
                    contacts={contacts}
                    deals={deals}
                    onEdit={handleEditActivity}
                    onDelete={handleDeleteActivity}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Activity Form Modal */}
      <Modal
        isOpen={showActivityForm}
        onClose={() => {
          setShowActivityForm(false);
          setEditingActivity(null);
        }}
        title={editingActivity ? "Edit Activity" : "Add New Activity"}
        size="md"
      >
        <ActivityForm
          activity={editingActivity}
          contacts={contacts}
          deals={deals}
          onSave={handleSaveActivity}
          onCancel={() => {
            setShowActivityForm(false);
            setEditingActivity(null);
          }}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingActivity}
        onClose={() => setDeletingActivity(null)}
        title="Delete Activity"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this activity? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setDeletingActivity(null)}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Activities;