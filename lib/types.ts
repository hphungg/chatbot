export type User = {
    id: string;
    email: string;
    name: string;
    image?: string | null | undefined;
}

export type Attachment = {
    name: string;
    url: string;
    contentType: string;
};