import { MetadataItem } from "@iiif/presentation-3";
import Group from "components/Group/Group";
import React from "react";

interface RequiredStatementProps {
  requiredStatement: MetadataItem;
}

const RequiredStatement: React.FC<RequiredStatementProps> = ({
  requiredStatement,
}) => <Group item={requiredStatement} />;

export default RequiredStatement;
