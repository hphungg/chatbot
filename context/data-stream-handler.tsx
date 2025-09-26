"use client";

import { useEffect, useRef } from "react";
import { useDataStream } from "./data-stream-provider";

export function DataStreamHandler() {
    const { dataStream } = useDataStream();

    const lastProcessedIndex = useRef(-1);

    return null;
}