/**
 * MeetGeek API Client
 * Based on reference/mcp-server/src/services/meetgeek-api.ts
 */

import { getApiKey } from "./config.js";

const BASE_URL = process.env.MEETGEEK_BASE_URL || "https://api.meetgeek.ai/v1";

export class MeetGeekClient {
  constructor(apiKey) {
    this.apiKey = apiKey || getApiKey();
    if (!this.apiKey) {
      throw new Error("No API key found. Run 'meetgeek auth' to set up your API key.");
    }
    this.baseUrl = BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`MeetGeek API error (${response.status}): ${error}`);
    }

    return response.json();
  }

  async getMeetings(params = {}) {
    const query = new URLSearchParams();
    if (params.limit) query.set("limit", params.limit);
    if (params.cursor) query.set("cursor", params.cursor);
    const qs = query.toString();
    return this.request(`/meetings${qs ? `?${qs}` : ""}`);
  }

  async getMeetingDetails(meetingId) {
    return this.request(`/meetings/${meetingId}`);
  }

  async getTranscript(meetingId) {
    return this.request(`/meetings/${meetingId}/transcript`);
  }

  async getHighlights(meetingId) {
    return this.request(`/meetings/${meetingId}/highlights`);
  }

  async getSummary(meetingId) {
    return this.request(`/meetings/${meetingId}/summary`);
  }
}

export function createClient() {
  return new MeetGeekClient();
}
