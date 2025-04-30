import { addDoc, collection, Timestamp } from "firebase/firestore";
import { db } from "./firebase";
import { getAuth } from "firebase/auth";

export const logAction = async (actionType, itemData) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    let assetName = itemData?.partNumber || itemData?.name || "Unknown";

    if (actionType === "edit" && itemData.oldItem && itemData.newItem) {
      assetName =
        itemData.newItem.partNumber || itemData.newItem.name || "Unknown";
    }

    const logEntry = {
      actionType,
      assetName,
      user: user ? user.displayName || user.email : "Unknown",
      timestamp: Timestamp.now(),
      changes:
        actionType === "edit"
          ? getChanges(itemData.oldItem, itemData.newItem)
          : null,
    };

    await addDoc(collection(db, "assetLogs"), logEntry);
  } catch (error) {
    console.error("Error logging action:", error);
  }
};

const getChanges = (oldItem, newItem) => {
  const changes = {};

  for (const key in newItem) {
    if (newItem[key] !== oldItem[key]) {
      changes[key] = {
        from: oldItem[key],
        to: newItem[key],
      };
    }
  }

  if (Object.keys(changes).length === 0) {
    console.log("No changes detected");
  }

  return Object.keys(changes).length ? changes : null;
};
