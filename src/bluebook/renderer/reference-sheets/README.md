# Reference sheets

These HTML reference sheets are included in the exam player for the SAT and for some AP exams. They occupy their own iframe and do not otherwise interact with the player itself. Sheets are included in exams based on the test package configuration.

## Previewing

The [shareable storybook](https://shareable-dev.stp-nonprod.collegeboard.org/) currently points to the `ref_sheet_turkey` branch, which tracks the branch `thankgiving-turkey-bus-to-int` which contains the changes for the January 6 release. We'll [run the workflow regularly]( https://github.com/collegeboard-bluebox/exam-player/actions/workflows/on-trigger-shareable-deploy.yml) to ensure it's up-to-date.  

To view the content itself, look under the **Reference Sheets** section. To view them within the player, look under **Taking an Exam -> Exam Reference Sheet Review.**

Avoid committing directly to the turkey branch unless you are making global changes (JS updates, this README, etc). 

**IMPORTANT**: We are currently working on the `ref_sheet_turkey` branch. The otehr ref sheet branches have been merged into develop and should no longer be used. We are keeping them for historical reference only; do not commit or push them.  

## Update process

To update the reference sheets, create a new branch from `ref_sheet_turkey`. Make your changes, then create a PR when you're ready for stakeholders to review your changes. 

As always be sure each commit is properly tagged to a Jira branch. If you make changes directly to the preview branch, tag them for the epic ([`DAPI-18002`](https://collegeboard.atlassian.net/browse/DAPI-18002)). 

In order to reduce merge conflicts, please be sure to regularly pull changes from develop into your working branch. 
