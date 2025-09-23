import { UIMessage } from "ai";
import { z } from "zod";

export type User = {
    id: string;
    email: string;
    name: string;
    image?: string | null | undefined;
}

export const messageMetaDataSchema = z.object({
    createdAt: z.string(),
});

export type MessageMetaData = z.infer<typeof messageMetaDataSchema>;

export type ChatTools = {
    // Tool identifiers
};

export type CustomUIDataTypes = {
    textDelta: string;
    imageDelta: string;
    sheetDelta: string;
    codeDelta: string;
    appendMessage: string;
    id: string;
    title: string;
    clear: null;
    finish: null;
};

export type ChatMessage = UIMessage<
    MessageMetaData,
    CustomUIDataTypes,
    ChatTools
>;

export type Chat = {
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
};

export type Attachment = {
    name: string;
    url: string;
    contentType: string;
};