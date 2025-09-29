"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useChatContext } from "@/context/chat-context";
import { createGroupChat } from "@/app/api/group/queries";
import { useRouter } from "next/navigation";

export function CreateGroupDialog() {
    const { open, setOpen, addGroups } = useChatContext();
    const [formData, setFormData] = useState({
        title: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isOpen = open === 'create-group';
    const router = useRouter();

    const handleClose = () => {
        setOpen(null);
        setFormData({
            title: "",
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            toast.error("Please fill in title");
            return;
        }

        setIsSubmitting(true);

        try {
            const group = await createGroupChat(formData.title);
            toast.success("Group chat created successfully!");
            handleClose();
            addGroups(group);
            router.push(`/chat`);
        } catch (error) {
            console.error("Error creating group chat:", error);
            toast.error("Failed to create group chat");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
    };


    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px] p-3 pt-4">
                <DialogHeader>
                    <DialogTitle>Group Chat Title</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleInputChange("title", e.target.value)}
                        placeholder="Enter group chat title"
                        className="mb-4 mt-2"
                        required
                    />

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="gap-2"
                        >
                            {isSubmitting && (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            )}
                            {isSubmitting ? "Creating..." : "Create Group Chat"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}