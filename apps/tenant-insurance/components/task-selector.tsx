"use client";

import { useTranslations } from "next-intl";
import * as React from "react";
import { useAtom } from "jotai";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useTaskStore } from "@/lib/task-store";
import { taskSelectorOpenAtom } from "@/lib/atoms";

export function TaskSelector() {
	const t = useTranslations();
	const running = useTaskStore((s) => s.running);
	const finishedAt = useTaskStore((s) => s.finishedAt);
	const begin = useTaskStore((s) => s.begin);

	const [open, setOpen] = useAtom(taskSelectorOpenAtom);

	React.useEffect(() => {
		// Show on first load of the home page if nothing is running
		if (!running) setOpen(true);
	}, [running, setOpen]);

	function startTask(label: string) {
		begin(label);
		setOpen(false);
	}

	return (
		<Dialog open={open} onOpenChange={setOpen} aria-label="Task selection dialog">
			<DialogContent aria-label="Task selection options">
				<DialogHeader aria-label="Task selection header">
					<DialogTitle>{t("TaskSelector.title")}</DialogTitle>
					<DialogDescription>{t("TaskSelector.desc")}</DialogDescription>
				</DialogHeader>
				<div className="grid gap-2" aria-label="Available tasks">
					<Button onClick={() => startTask(t("TaskSelector.tasks.t1"))} aria-label="Select task 1">
						{t("TaskSelector.tasks.t1")}
					</Button>
					<Button onClick={() => startTask(t("TaskSelector.tasks.t2"))} aria-label="Select task 2">
						{t("TaskSelector.tasks.t2")}
					</Button>
					<Button onClick={() => startTask(t("TaskSelector.tasks.t3"))} aria-label="Select task 3">
						{t("TaskSelector.tasks.t3")}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
