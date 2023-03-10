import * as target from "../../src/features/PullRequestFileSize";
import {Context} from "probot";
import {DEFAULT_CONFIG} from "../../src/shared/constants/DefaultConfig";
import removePreviousSizeLabels from "../../src/shared/RemovePreviousSizeLabels";
import addLabelsToPullRequest from "../../src/shared/AddLabelsToPullRequest";
import {FILES_LABEL_PREFIX} from "../utils/Constants";
import {PullRequestFile} from "../../src/shared/GetFilesChanged";

jest.mock("../../src/shared/RemovePreviousSizeLabels");
jest.mock("../../src/shared/AddLabelsToPullRequest");

const mockedRemovePreviousSizeLabels = jest.mocked(removePreviousSizeLabels);
const mockedAddLabelsToPullRequest = jest.mocked(addLabelsToPullRequest);

describe("pull request file size", () => {
  [
    {expectedLabel: "XXL", changedFiles: 100},
    {expectedLabel: "XXL", changedFiles: 61},
    {expectedLabel: "XL", changedFiles: 60},
    {expectedLabel: "XL", changedFiles: 41},
    {expectedLabel: "L", changedFiles: 40},
    {expectedLabel: "L", changedFiles: 26},
    {expectedLabel: "M", changedFiles: 25},
    {expectedLabel: "M", changedFiles: 11},
    {expectedLabel: "S", changedFiles: 10},
    {expectedLabel: "S", changedFiles: 6},
    {expectedLabel: "XS", changedFiles: 5},
    {expectedLabel: "XS", changedFiles: 1},
  ].forEach(({expectedLabel, changedFiles}) => {
    it(`should add label ${FILES_LABEL_PREFIX}${expectedLabel} when changed files is ${changedFiles}`, async () => {
      const context = buildPullRequestContext(changedFiles);

      await target.updatePullRequestWithFileSizeLabel(context, DEFAULT_CONFIG, false);

      expect(mockedAddLabelsToPullRequest).toHaveBeenCalledTimes(1);
      expect(mockedAddLabelsToPullRequest).toHaveBeenCalledWith(context, [
        `${FILES_LABEL_PREFIX}${expectedLabel}`,
      ]);
    });
  });

  it("should call removePreviousSizeLabels", async () => {
    const context = buildPullRequestContext(1);

    await target.updatePullRequestWithFileSizeLabel(context, DEFAULT_CONFIG, false);

    expect(mockedRemovePreviousSizeLabels).toHaveBeenCalledTimes(1);
    expect(mockedRemovePreviousSizeLabels).toHaveBeenCalledWith(
      context,
      `${FILES_LABEL_PREFIX}XS`,
      DEFAULT_CONFIG.files
    );
  });

  it("should call getFilesChanged when omitted exists", async () => {
    const context = buildPullRequestContext(1);
    const pullRequestFile = {} as PullRequestFile;

    await target.updatePullRequestWithFileSizeLabel(context, DEFAULT_CONFIG, [pullRequestFile]);

    expect(mockedAddLabelsToPullRequest).toHaveBeenCalledWith(context, [`${FILES_LABEL_PREFIX}XS`]);
  });
});

function buildPullRequestContext(changedFiles = 100): Context<"pull_request"> {
  return {
    name: "pull_request",
    id: "",
    payload: {
      pull_request: {
        changed_files: changedFiles,
      },
    },
  } as unknown as Context<"pull_request">;
}
