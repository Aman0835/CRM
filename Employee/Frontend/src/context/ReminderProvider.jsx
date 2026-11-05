import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { getMyReminders } from "../leads/services/leadService";
import { useAuth } from "./AuthContext";

export default function ReminderProvider({ children }) {
  const { employee } = useAuth();
  const notifiedSet = useRef(new Set());

  useEffect(() => {
    if (!employee) return;

    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    const checkReminders = async () => {
      try {
        const res = await getMyReminders();
        if (!res || !res.data) return;

        const now = new Date();
        const currentMs = now.getTime();

        res.data.forEach((lead) => {
          if (!lead.nextFollowUp || !lead.nextFollowUp.date) return;
          
          const followUpDate = new Date(lead.nextFollowUp.date);
          if (lead.nextFollowUp.time) {
            const [time, modifier] = lead.nextFollowUp.time.split(" ");
            let [hours, minutes] = time.split(":");
            if (hours === "12") hours = "00";
            if (modifier && modifier.toUpperCase() === "PM") hours = parseInt(hours, 10) + 12;
            followUpDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
          }

          const followUpMs = followUpDate.getTime();
          const diffMs = followUpMs - currentMs;
          
          if (Math.abs(diffMs) <= 120000 && !notifiedSet.current.has(lead._id)) {
            notifiedSet.current.add(lead._id);
            
            const message = `Reminder: Follow-up with ${lead.name} at ${lead.nextFollowUp.time || "now"}\nAction: ${lead.nextFollowUp.action}`;
            
            toast(message, {
              icon: "🔔",
              duration: 10000,
              style: {
                background: "#24110c",
                color: "#FBFAF6",
                border: "1px solid #381C14",
              },
            });

            if ("Notification" in window && Notification.permission === "granted") {
              new Notification("Upcoming Lead Follow-up", {
                body: message,
              });
            }
          }
        });
      } catch (err) {
        console.error("Failed to check reminders", err);
      }
    };

    checkReminders();
    const interval = setInterval(checkReminders, 60000);

    return () => clearInterval(interval);
  }, [employee]);

  return <>{children}</>;
}
