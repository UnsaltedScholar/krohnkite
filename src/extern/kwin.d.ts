/*
    SPDX-FileCopyrightText: 2018 Eon S. Jeon <esjeon@hyunmu.am>
    SPDX-FileCopyrightText: 2024 Vjatcheslav V. Kolchkov <akl334@protonmail.ch>

    SPDX-License-Identifier: MIT
*/

// API Reference:
//     https://techbase.kde.org/Development/Tutorials/KWin/Scripting/API_4.9
interface KWin {
  readConfig<T>(property: string, defaultValue: T): T;
  registerShortcut(
    name: string,
    desc: string,
    key: string,
    callback: Function
  ): void;
  callDBus(
    service: string,
    path: string,
    interf: string,
    method: string,
    ...args: any[]
  ): void;
  registerScreenEdge(edge: number, callback: Function): void;
  unregisterScreenEdge(edge: number): void;
  registerTouchScreenEdge(edge: number, callback: Function): void;
  unregisterTouchScreenEdge(edge: number): void;
  registerUserActionsMenu(callback: Function): void;

}
// **This creates the global runtime variable** that KWin provides.
declare const kwin: KWin;

// optional convenience: also make callDBus available as a top-level function
declare function callDBus(
  service: string,
  path: string,
  interf: string,
  method: string,
  ...args: any[]
): any;

// interface IOptions {
//   configChanged: QSignal;
// }
