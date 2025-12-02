import React from "react";
import { Video } from "lucide-react";
import ReactPlayer from "react-player";

import {
  DialogTrigger,
  DialogContent,
  Dialog,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";

interface VideoModalProps {
  src: string;
  title: string;
  trigger?: React.ReactNode;
}

const VideoModal = ({ src, trigger, title }: VideoModalProps) => {
  const defaultTrigger = (
    <Button size="sm" variant={"ghost"} className="cursor-pointer shadow-lg">
      <Video className="h-4 w-4" />
    </Button>
  );
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="py-1 max-h-[80vh] overflow-y-auto">
          <ReactPlayer
            style={{ width: "100%", height: "auto", aspectRatio: "16/9" }}
            src={src}
            config={{
              youtube: {
                color: "white",
              },
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoModal;
