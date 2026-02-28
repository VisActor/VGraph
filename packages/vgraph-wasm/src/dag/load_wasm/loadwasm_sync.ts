import { load_dot_wasm_sync } from "./encoded_dot_wasm";
import { wasmModule } from "./loadwasm";
import ModuleSync from "./module_sync";

export function loadWasmSync() {
  wasmModule.wasm = ModuleSync({ wasm: load_dot_wasm_sync() });
  wasmModule.status = "loaded";
}
