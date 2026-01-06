#!/usr/bin/env node
/**
 * MeetGeek CLI - Command-line interface for MeetGeek meeting intelligence
 */

import { Command } from "commander";
import chalk from "chalk";
import { createClient } from "./lib/api.js";
import { getApiKey, setApiKey, clearApiKey, getConfigPath } from "./lib/config.js";
import { createInterface } from "readline";

const program = new Command();

program
  .name("meetgeek")
  .description("CLI for MeetGeek meeting intelligence")
  .version("0.1.0");

// Auth command
program
  .command("auth")
  .description("Set up your MeetGeek API key")
  .option("--clear", "Remove saved API key")
  .option("--show", "Show current API key status")
  .action(async (options) => {
    if (options.clear) {
      clearApiKey();
      console.log(chalk.green("✅ API key removed."));
      return;
    }

    if (options.show) {
      const key = getApiKey();
      if (key) {
        console.log(chalk.green(`✅ API key configured (${key.slice(0, 8)}...${key.slice(-4)})`));
        console.log(chalk.gray(`   Config: ${getConfigPath()}`));
      } else {
        console.log(chalk.yellow("⚠️  No API key configured. Run 'meetgeek auth' to set up."));
      }
      return;
    }

    console.log(chalk.cyan("\n🔐 MeetGeek API Setup\n"));
    console.log(chalk.white("To get your API key:"));
    console.log(chalk.gray("  1. Log in to https://meetgeek.ai"));
    console.log(chalk.gray("  2. Go to Integrations"));
    console.log(chalk.gray("  3. Find 'Public API Integration'"));
    console.log(chalk.gray("  4. Generate or copy your API key\n"));

    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const question = (prompt) => new Promise((resolve) => {
      rl.question(prompt, (answer) => {
        resolve(answer);
      });
    });

    try {
      const apiKey = await question(chalk.yellow("Paste your API key: "));
      rl.close();

      if (!apiKey || apiKey.trim().length < 10) {
        console.log(chalk.red("\n❌ Invalid API key."));
        process.exit(1);
      }

      // Test the key
      console.log(chalk.gray("\nVerifying API key..."));
      const { MeetGeekClient } = await import("./lib/api.js");
      const client = new MeetGeekClient(apiKey.trim());
      
      try {
        await client.getMeetings({ limit: 1 });
        setApiKey(apiKey.trim());
        console.log(chalk.green("\n✅ API key verified and saved!"));
        console.log(chalk.gray(`   Config: ${getConfigPath()}`));
        console.log(chalk.cyan("\nTry 'meetgeek list' to see your meetings."));
      } catch (e) {
        console.log(chalk.red(`\n❌ API key verification failed: ${e.message}`));
        process.exit(1);
      }
    } catch (e) {
      rl.close();
      console.log(chalk.red(`\nError: ${e.message}`));
      process.exit(1);
    }
  });

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
        const date = new Date(meeting.timestamp_start_utc).toLocaleDateString();
        const duration = meeting.timestamp_end_utc && meeting.timestamp_start_utc
          ? Math.round((new Date(meeting.timestamp_end_utc) - new Date(meeting.timestamp_start_utc)) / 60000)
          : "?";
        console.log(chalk.white(`  ${chalk.bold(meeting.meeting_id.slice(0, 8))}  ${meeting.title || "Untitled"}`));
        console.log(chalk.gray(`           ${date} • ${duration} min\n`));
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
      console.log(chalk.white(`  ID:          ${meeting.meeting_id}`));
      console.log(chalk.white(`  Start:       ${new Date(meeting.timestamp_start_utc).toLocaleString()}`));
      console.log(chalk.white(`  End:         ${new Date(meeting.timestamp_end_utc).toLocaleString()}`));
      if (meeting.participants?.length) {
        console.log(chalk.white(`  Participants: ${meeting.participants.map(p => p.name || p.email).join(", ")}`));
      }
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
      
      if (data.summary) {
        console.log(data.summary);
      } else if (data.sections) {
        for (const section of data.sections) {
          console.log(chalk.yellow(`\n${section.title}:\n`));
          console.log(section.content);
        }
      } else {
        console.log(chalk.yellow("No summary available."));
      }
      
      if (data.action_items?.length) {
        console.log(chalk.cyan("\n✅ Action Items:\n"));
        for (const item of data.action_items) {
          console.log(chalk.white(`  • ${typeof item === 'string' ? item : item.text || item.description}`));
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
      
      const transcript = data.sentences || data.transcript || data.entries || data;
      
      if (Array.isArray(transcript)) {
        for (const entry of transcript) {
          const speaker = entry.speaker || entry.speaker_name || "Unknown";
          const text = entry.transcript || entry.text || entry.content || "";
          const time = entry.timestamp ? new Date(entry.timestamp).toLocaleTimeString() : "";
          const line = `[${time}] ${chalk.bold(speaker)}: ${text}`;
          console.log(line);
          output += `[${time}] ${speaker}: ${text}\n`;
        }
      } else {
        console.log(JSON.stringify(data, null, 2));
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
      
      const highlights = data.highlights || data.key_moments || data;
      
      if (!Array.isArray(highlights) || !highlights.length) {
        console.log(chalk.yellow("No highlights available."));
        console.log(chalk.gray("\nRaw response:"));
        console.log(JSON.stringify(data, null, 2));
        return;
      }

      for (const highlight of highlights) {
        const time = highlight.timestamp || highlight.start_time || "";
        const text = highlight.text || highlight.content || highlight.description || "";
        console.log(chalk.yellow(`  [${time}]`));
        console.log(chalk.white(`  ${text}\n`));
      }
    } catch (err) {
      console.error(chalk.red(`Error: ${err.message}`));
      process.exit(1);
    }
  });

// Natural language search
program
  .command("ask <query...>")
  .description("Search meetings with natural language")
  .option("-m, --meeting <id>", "Search in specific meeting")
  .action(async (query, options) => {
    const searchQuery = query.join(" ").toLowerCase();
    console.log(chalk.cyan(`\n🔍 Searching for: "${searchQuery}"\n`));
    
    try {
      const client = createClient();
      
      if (options.meeting) {
        // Search in specific meeting
        const transcript = await client.getTranscript(options.meeting);
        const entries = transcript.sentences || transcript.transcript || transcript.entries || [];
        
        const matches = entries.filter(e => 
          (e.transcript || e.text || e.content || "").toLowerCase().includes(searchQuery)
        );
        
        if (matches.length) {
          console.log(chalk.green(`Found ${matches.length} matches:\n`));
          for (const match of matches.slice(0, 10)) {
            const speaker = match.speaker || match.speaker_name || "Unknown";
            const time = match.timestamp ? new Date(match.timestamp).toLocaleTimeString() : "";
            console.log(chalk.yellow(`[${time}] ${speaker}:`));
            console.log(chalk.white(`  ${match.transcript || match.text || match.content}\n`));
          }
        } else {
          console.log(chalk.yellow("No matches found in this meeting."));
        }
      } else {
        // Search across recent meetings
        const meetings = await client.getMeetings({ limit: 10 });
        console.log(chalk.gray(`Searching across ${meetings.meetings.length} recent meetings...\n`));
        
        for (const meeting of meetings.meetings) {
          try {
            const transcript = await client.getTranscript(meeting.meeting_id);
            const entries = transcript.sentences || transcript.transcript || transcript.entries || [];
            
            const matches = entries.filter(e => 
              (e.transcript || e.text || e.content || "").toLowerCase().includes(searchQuery)
            );
            
            if (matches.length) {
              console.log(chalk.cyan(`📋 ${meeting.title} (${matches.length} matches)`));
              for (const match of matches.slice(0, 3)) {
                const speaker = match.speaker || match.speaker_name || "Unknown";
                console.log(chalk.gray(`   ${speaker}: ${(match.transcript || match.text || match.content || "").slice(0, 100)}...`));
              }
              console.log();
            }
          } catch (e) {
            // Skip meetings without transcripts
          }
        }
      }
    } catch (err) {
      console.error(chalk.red(`Error: ${err.message}`));
      process.exit(1);
    }
  });

program.parse();
