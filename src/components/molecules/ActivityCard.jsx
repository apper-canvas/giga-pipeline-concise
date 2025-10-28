import React from "react";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";
import { format } from "date-fns";

const ActivityCard = ({ activity, contacts, deals, onEdit, onDelete }) => {
  const getActivityIcon = (type) => {
    const icons = {
      call: "Phone",
      email: "Mail",
      meeting: "Calendar",
      note: "FileText",
      task: "CheckSquare"
    };
    return icons[type] || "Clock";
  };

  const getActivityColor = (type) => {
    const colors = {
      call: "bg-blue-100 text-blue-600",
      email: "bg-green-100 text-green-600",
      meeting: "bg-purple-100 text-purple-600",
      note: "bg-gray-100 text-gray-600",
      task: "bg-orange-100 text-orange-600"
    };
    return colors[type] || "bg-gray-100 text-gray-600";
  };

  const getTypeLabel = (type) => {
    const labels = {
      call: "Call",
      email: "Email",
      meeting: "Meeting",
      note: "Note",
      task: "Task"
    };
    return labels[type] || type;
  };

  const contactName = (() => {
    if (activity.contact_id_c?.Name) {
      return activity.contact_id_c.Name;
    }
    const contact = contacts.find((c) => c.Id === activity.contact_id_c);
    return contact?.name_c || "Unknown Contact";
  })();

  const dealName = (() => {
    if (!activity.deal_id_c) return null;
    if (activity.deal_id_c?.Name) {
      return activity.deal_id_c.Name;
    }
    const deal = deals.find((d) => d.Id === activity.deal_id_c);
    return deal?.name_c || null;
  })();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1 min-w-0">
          {/* Activity Icon */}
          <div
            className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getActivityColor(
              activity.type_c
            )}`}
          >
            <ApperIcon name={getActivityIcon(activity.type_c)} className="w-5 h-5" />
          </div>

          {/* Activity Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <Badge variant="primary" size="sm">
                {getTypeLabel(activity.type_c)}
              </Badge>
              <span className="text-sm text-gray-500">
                {format(new Date(activity.date_c), "MMM dd, yyyy 'at' h:mm a")}
              </span>
            </div>

            <p className="text-gray-900 mb-2 whitespace-pre-wrap">
              {activity.description_c}
            </p>

            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
              <div className="flex items-center">
                <ApperIcon name="User" className="w-4 h-4 mr-1" />
                <span>{contactName}</span>
              </div>
              {dealName && (
                <div className="flex items-center">
                  <ApperIcon name="DollarSign" className="w-4 h-4 mr-1" />
                  <span>{dealName}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 ml-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(activity)}
            className="p-2"
          >
            <ApperIcon name="Edit2" className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(activity)}
            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <ApperIcon name="Trash2" className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ActivityCard;