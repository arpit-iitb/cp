import { DiscussionData } from "../../_utils/interface";
import React from "react";

export default function DiscussionCard(props: DiscussionData) {
    return <>
        <div className="text-[#222]">

            <div className="flex w-full justify-between mb-3">
                <p className="flex items-center">
                    <img src='/Profile.webp' alt="Profile Picture" className="w-8 h-8 object-cover rounded-full" />
                    <span className="ml-3">{props.username}</span>
                </p>
                <p className="text-[#000318] opacity-50"> {new Date(props.created_on).toLocaleString('en-IN', {
                    month: "long",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true
                })}</p>
            </div>
            <div className="px-2 py-4 w-auto text-justify text-secondary-900">
                <p>{props.discussion_text}</p>
            </div>
        </div>
    </>
}