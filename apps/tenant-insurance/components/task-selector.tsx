"use client";

import { useTranslations } from "next-intl";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useTaskStore } from "@/lib/task-store";

export function TaskSelector() {
	const t = useTranslations();
	const running = useTaskStore((s) => s.running);
	const finishedAt = useTaskStore((s) => s.finishedAt);
	const begin = useTaskStore((s) => s.begin);

	const [open, setOpen] = React.useState(false);

	React.useEffect(() => {
		// Show on first load of the home page if nothing is running
		if (!running) setOpen(true);
	}, [running]);

	function startTask(label: string) {
		begin(label);
		setOpen(false);
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{t("TaskSelector.title")}</DialogTitle>
					<DialogDescription>{t("TaskSelector.desc")}</DialogDescription>
				</DialogHeader>
				<div className="grid gap-2">
					<Button onClick={() => startTask(t("TaskSelector.tasks.t1"))}>
						{t("TaskSelector.tasks.t1")}
					</Button>
					<Button onClick={() => startTask(t("TaskSelector.tasks.t2"))}>
						{t("TaskSelector.tasks.t2")}
					</Button>
					<Button onClick={() => startTask(t("TaskSelector.tasks.t3"))}>
						{t("TaskSelector.tasks.t3")}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
