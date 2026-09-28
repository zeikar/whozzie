"use client";

import { Component, type ReactNode } from "react";

/**
 * Catches the 3D table failing to start (no WebGL, a blocklisted GPU, a chunk
 * that won't load) so the picker carries on without it rather than taking
 * the page down. React still reports the error to the console.
 */
export class TableBoundary extends Component<{ onFail: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onFail();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
