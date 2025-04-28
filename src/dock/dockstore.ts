// Copyright (c) 2025 Vjatcheslav V. Kolchkov <akl334@protonmail.ch>
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the "Software"),
// to deal in the Software without restriction, including without limitation
// the rights to use, copy, modify, merge, publish, distribute, sublicense,
// and/or sell copies of the Software, and to permit persons to whom the
// Software is furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL
// THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
// DEALINGS IN THE SOFTWARE.

class DockStore implements IDockStore {
  private store: { [SurfaceId: string]: DockEntry };
  private defaultCfg: DefaultDockCfg | null;
  private surfacesCfg: dockSurfaceCfg[];
  private windowClassesCfg: { [windowClassName: string]: IDock };

  constructor() {
    this.store = {};
    this.defaultCfg = null;
    this.surfacesCfg = [];
    this.windowClassesCfg = {};
  }

  public render(
    srf: ISurface,
    visibles: WindowClass[],
    workingArea: Rect
  ): Rect {
    if (this.defaultCfg === null) {
      this.defaultCfg = DefaultDockCfg.instance;
      this.surfacesCfg = parseDockUserSurfacesCfg();
      this.windowClassesCfg = parseDockUserWindowClassesCfg();
    }
    if (!this.store[srf.id]) {
      this.store[srf.id] = new DockEntry(this.getSurfaceCfg(srf), srf.id);
    }
    let dockedWindows = visibles.filter((w) => {
      if (w.state === WindowState.Docked) {
        if (w.dock === null && w.windowClassName in this.windowClassesCfg) {
          w.dock = this.windowClassesCfg[w.windowClassName].clone();
        }
        return true;
      }
    });
    if (dockedWindows.length === 0) return workingArea;

    return this.store[srf.id].arrange(dockedWindows, workingArea);
  }

  public remove(window: WindowClass) {
    for (let key in this.store) {
      this.store[key].remove(window);
    }
  }

  public handleShortcut(
    ctx: IDriverContext,
    window: WindowClass,
    shortcut: Shortcut
  ): boolean {
    switch (shortcut) {
      case Shortcut.SwapLeft:
      case Shortcut.SwapUp:
      case Shortcut.SwapRight:
      case Shortcut.SwapDown:
        const srf = ctx.currentSurface;
        if (this.store[srf.id]) {
          return this.store[srf.id].handleShortcut(window, shortcut);
        }
        return false;
      default:
        return false;
    }
  }

  public isNewWindowHaveDocked(window: WindowClass): boolean {
    if (
      window.windowClassName in this.windowClassesCfg &&
      this.windowClassesCfg[window.windowClassName].autoDock === true
    )
      return true;
    return false;
  }

  private getSurfaceCfg(srf: ISurface): dockSurfaceCfg {
    let dockCfg: IDockCfg | null = null;
    for (let surfaceCfg of this.surfacesCfg) {
      if (surfaceCfg.isFit(srf)) {
        dockCfg = { ...surfaceCfg.cfg };
        break;
      }
    }
    if (dockCfg === null) dockCfg = this.defaultCfg!.cloneAndUpdate({});
    let [outputName, activityId, vDesktopName] = srf.getParams();

    return new dockSurfaceCfg(outputName, activityId, vDesktopName, dockCfg);
  }
}
