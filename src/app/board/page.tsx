import type { Metadata } from "next";
import { BoardView } from "@/features/board/board-view";

export const metadata: Metadata = { title: "Board" };

export default function BoardPage() {
  return <BoardView />;
}
