import { Alert } from "react-native";
import { eq } from "drizzle-orm";

import { db } from "@/db/client";
import { expensesTable, type Expense } from "@/db/schema";
import { formatMoney } from "@/lib/money";

export function useDeleteExpense() {
  return function confirmDelete(item: Expense) {
    Alert.alert(
      "Delete expense?",
      `${formatMoney(item.amount)} · ${item.note || item.category}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await db
                .delete(expensesTable)
                .where(eq(expensesTable.id, item.id));
            } catch {
              Alert.alert("Could not delete expense", "Please try again.");
            }
          },
        },
      ],
    );
  };
}
