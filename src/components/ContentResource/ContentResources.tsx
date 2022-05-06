import React, { useEffect, useRef } from "react";
import { styled } from "stitches";
import Hls from "hls.js";
import { useGetImageResource } from "hooks/useGetImageResource";
import sanitizeAttributes from "services/html-element";
import { useGetLabel } from "hooks/useGetLabel";
import { NectarContentResource } from "types/nectar";

const StyledResource = styled("img", { objectFit: "cover" });

const ContentResource: React.FC<NectarContentResource> = (props) => {
  const mediaRef = useRef(null);
  const { contentResource, altAsLabel } = props;

  let alt: string | undefined;
  if (altAsLabel) alt = useGetLabel(altAsLabel) as string;

  /**
   * Create attributes and remove React props
   */
  const remove = ["contentResource", "altAsLabel"];
  const attributes = sanitizeAttributes(props, remove);

  const { type, id, width = 200, height, format, duration } = contentResource;

  useEffect(() => {
    /**
     * Check that IIIF content resource ID exists and
     * we have a reffed <video> for attaching HLS
     */
    if (!id && !mediaRef.current) return;
    if (["Image"].includes(type)) return;

    /**
     * Eject HLS attachment if file extension from
     * the IIIF content resource ID is not .m3u8
     */
    if (!id.includes("m3u8")) return;

    // Bind hls.js package to our <video /> element and then load the media source
    const hls = new Hls();

    if (mediaRef.current) {
      hls.attachMedia(mediaRef.current);
      hls.on(Hls.Events.MEDIA_ATTACHED, function () {
        hls.loadSource(id as string);
      });
    }

    // Handle errors
    hls.on(Hls.Events.ERROR, function (event, data) {
      if (data.fatal) {
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            // try to recover network error
            console.error(
              `fatal ${event} network error encountered, try to recover`
            );
            hls.startLoad();
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            console.error(
              `fatal ${event} media error encountered, try to recover`
            );
            hls.recoverMediaError();
            break;
          default:
            // cannot recover
            hls.destroy();
            break;
        }
      }
    });

    return () => {
      if (hls) {
        hls.detachMedia();
        hls.destroy();
      }
    };
  }, []);

  useEffect(() => playLoop(), []);

  const playLoop = () => {
    if (!mediaRef.current) return;

    let startTime = 0;
    let loopTime = 30;

    if (duration) loopTime = duration;
    if (!id.split("#t=") && duration) startTime = duration * 0.1;

    if (id.split("#t=").pop()) {
      const fragment = id.split("#t=").pop();
      if (fragment) startTime = parseInt(fragment.split(",")[0]);
    }

    const media: HTMLVideoElement = mediaRef.current;
    media.currentTime = startTime;
    media.play();

    setTimeout(() => playLoop(), loopTime * 1000);
  };

  switch (type) {
    case "Image":
      const src = useGetImageResource(contentResource);
      return (
        <StyledResource
          as="img"
          alt={alt}
          css={{ width: width, height: height }}
          key={id}
          src={src}
          {...attributes}
        />
      );

    case "Video":
      return (
        <StyledResource
          as="video"
          css={{ width: width, height: height }}
          key={id}
          loop
          muted
          onPause={playLoop}
          ref={mediaRef}
          src={id}
        />
      );

    default:
      console.warn(
        `Resource type: ${type} is not valid or not yet supported in Nectar.`
      );
      return <></>;
  }
};

export default ContentResource;
