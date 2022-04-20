import React, { useEffect, useState } from "react";
import { Vault } from "@iiif/vault";
import ReactDOM from "react-dom";
import { ManifestNormalized } from "@iiif/presentation-3";
import {
  Label,
  Metadata,
  RequiredStatement,
  Summary,
  Thumbnail,
} from "./index";
import Language from "./dev/Language";

const Wrapper = () => {
  const [thumbnail, setThumbnail] = useState();
  const [manifest, setManifest] = useState<ManifestNormalized>();
  const [language, setLanguage] = useState<String | undefined>();

  const manifestId =
    "https://iiif.harvardartmuseums.org/manifests/object/307976";

  useEffect(() => {
    const vault = new Vault();
    if (manifestId)
      vault
        .loadManifest(manifestId)
        .then((data) => {
          setManifest(data);
          setThumbnail(vault.get(data.thumbnail));
        })
        .catch((error) => {
          console.error(`Manifest ${manifestId} failed to load: ${error}`);
        });
  }, [manifestId]);

  if (!manifest) return <>Loading...</>;

  const handleLanguage = (e) =>
    setLanguage(e.target.value !== "--" ? e.target.value : undefined);

  const { label, summary, metadata, requiredStatement } = manifest;

  return (
    <>
      <Language handleLanguage={handleLanguage} />
      <div>
        <Label
          as="h1"
          label={label}
          language={language}
          className="custom-class"
          style={{ color: "red" }}
        />
        <Summary summary={summary} language={language} />
        <Metadata metadata={metadata} language={language} />
        <RequiredStatement
          requiredStatement={requiredStatement}
          language={language}
        />
        {thumbnail && (
          <Thumbnail
            altAsLabel={label}
            language={language}
            thumbnail={thumbnail}
          />
        )}
      </div>
    </>
  );
};

ReactDOM.render(<Wrapper />, document.getElementById("root"));
