#!/usr/bin/env node
/**
 * MeetGeek CLI - Command-line interface for MeetGeek meeting intelligence
 */

import { Command } from "commander";
import chalk from "chalk";
import { createClient } from "./lib/api.js";

const program = new Command();

program
  .name("meetgeek")
  .description("CLI for MeetGeek meeting intelligence")
  .version("0.1.0");

// List meetings
program
  .command("list")
  .description("List recent meetings")
  .option("-l, --limit <n>", "Number of meetings to show", "10")
  .action(async (options) => {
    try {
      const client = createClient();
      const data = await client.getMeetings({ limit: options.limit });
      console.log(chalk.cyan("\n📋 Recent Meetings:\n"));
      
      if (!data.meetings?.length) {
        console.log(chalk.yellow("No meetings found."));
        return;
      }

      for (const meeting of data.meetings) {
        const date = new Date(meeting.created_at).toLocaleDateString();
        console.log(chalk.white(`  ${chalk.bold(meeting.id.slice(0, 8))}  ${meeting.title || "Untitled"}`));
        console.log(chalk.gray(`           ${date} • ${meeting.duration_minutes || "?"} min\n`));
      }
    } catch (err) {
      console.error(chalk.red(`Error: ${err.message}`));
      process.exit(1);
    }
  });

// Show meeting details
program
  .command("show <id>")
  .description("Show meeting details")
  .action(async (id) => {
    try {
      const client = createClient();
      const meeting = await client.getMeetingDetails(id);
      
      console.log(chalk.cyan(`\n📋 Meeting: ${chalk.bold(meeting.title || "Untitled")}\n`));
      console.log(chalk.white(`  ID:          ${meeting.id}`));
      console.log(chalk.white(`  Date:        ${new Date(meeting.created_at).toLocaleString()}`));
      console.log(chalk.white(`  Duration:    ${meeting.duration_minutes || "?"} minutes`));
      console.log(chalk.white(`  Participants: ${meeting.participants?.length || 0}`));
      if (meeting.recording_url) {
        console.log(chalk.white(`  Recording:   ${meeting.recording_url}`));
      }
      console.log();
    } catch (err) {
      console.error(chalk.red(`Error: ${err.message}`));
      process.exit(1);
    }
  });

// Get summary
program
  .command("summary <id>")
  .description("Get AI-generated meeting summary")
  .action(async (id) => {
    try {
      const client = createClient();
      const data = await client.getSummary(id);
      
      console.log(chalk.cyan("\n📝 Meeting Summary:\n"));
      console.log(data.summary || chalk.yellow("No summary available."));
      
      if (data.action_items?.length) {
        console.log(chalk.cyan("\n✅ Action Items:\n"));
        for (const item of data.action_items) {
          console.log(chalk.white(`  • ${item}`));
        }
      }
      console.log();
    } catch (err) {
      console.error(chalk.red(`Error: ${err.message}`));
      process.exit(1);
    }
  });

// Get transcript
program
  .command("transcript <id>")
  .description("Get meeting transcript")
  .option("-o, --output <file>", "Save to file")
  .action(async (id, options) => {
    try {
      const client = createClient();
      const data = await client.getTranscript(id);
      
      let output = "";
      console.log(chalk.cyan("\n📜 Transcript:\n"));
      
      for (const entry of data.transcript || []) {
        const line = `[${entry.timestamp}] ${chalk.bold(entry.speaker)}: ${entry.text}`;
        console.log(line);
        output += `[${entry.timestamp}] ${entry.speaker}: ${entry.text}\n`;
      }
      
      if (options.output) {
        const fs = await import("fs/promises");
        await fs.writeFile(options.output, output);
        console.log(chalk.green(`\n✅ Saved to ${options.output}`));
      }
      console.log();
    } catch (err) {
      console.error(chalk.red(`Error: ${err.message}`));
      process.exit(1);
    }
  });

// Get highlights
program
  .command("highlights <id>")
  .description("Get meeting highlights")
  .action(async (id) => {
    try {
      const client = createClient();
      const data = await client.getHighlights(id);
      
      console.log(chalk.cyan("\n⭐ Highlights:\n"));
      
      if (!data.highlights?.length) {
        console.log(chalk.yellow("No highlights available."));
        return;
      }

      for (const highlight of data.highlights) {
        console.log(chalk.yellow(`  [${highlight.timestamp}]`));
        console.log(chalk.white(`  ${highlight.text}\n`));
      }
    } catch (err) {
      console.error(chalk.red(`Error: ${err.message}`));
      process.exit(1);
    }
  });

// Natural language search (placeholder)
program
  .command("ask <query...>")
  .description("Search meetings with natural language")
  .action(async (query) => {
    const searchQuery = query.join(" ");
    console.log(chalk.cyan(`\n🔍 Searching for: "${searchQuery}"\n`));
    console.log(chalk.yellow("Natural language search coming soon..."));
    console.log(chalk.gray("For now, use 'meetgeek list' and 'meetgeek transcript <id>' to find content.\n"));
  });

program.parse();
