declare module "react-mic" {
  import * as React from "react";

  export interface ReactMicProps {
    record: boolean;
    className?: string;
    onStop: (recordedBlob: {
      blob: Blob;
      startTime: number;
      stopTime: number;
    }) => void;
    onData?: (chunk: any) => void;
    strokeColor?: string;
    backgroundColor?: string;
    mimeType?: string;
    echoCancellation?: boolean;
    autoGainControl?: boolean;
    noiseSuppression?: boolean;
    channelCount?: number;
  }

  export class ReactMic extends React.Component<ReactMicProps> {}
}
