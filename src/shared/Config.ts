import { DEFAULT_CONFIG } from "./DefaultConfig";
import { Context } from "probot";

export interface Config {
  labels: Labels;
  lines: LabelSizeConfig;
  files: LabelSizeConfig;
}

interface Labels {
  lines: boolean;
  files: boolean;
}

export interface LabelSizeConfig {
  sizing: Sizes;
  colours: SizeColours;
  prefix: string;
}

export enum LabelSuffix {
  XXL = "xxl",
  XL = "xl",
  L = "l",
  M = "m",
  S = "s",
  XS = "xs",
}

type Sizes = {
  [key in Exclude<LabelSuffix, "xs">]: number;
};

type SizeColours = {
  [key in LabelSuffix]: string;
};

export async function getConfig(
  context: Context<"pull_request">
): Promise<Config> {
  return (await context.config(
    "pullRequestSizing.yml",
    DEFAULT_CONFIG
  )) as Config;
}
