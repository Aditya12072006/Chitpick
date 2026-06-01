/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SavedList {
  id: string;
  name: string;
  names: string[];
}

export interface HistoryEntry {
  id: string;
  name: string;
  task: string;
  timestamp: string; // e.g. "12:34 PM"
  color: string;
}

export interface Chit {
  id: string;
  name: string;
  color1: string;
  color2: string;
  x: number;
  y: number;
  rotation: number;
  isFlipped: boolean;
  isGlowing: boolean;
}

export interface QuickTask {
  label: string;
  icon: string;
  text: string;
}
