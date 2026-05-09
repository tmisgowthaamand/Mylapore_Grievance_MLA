import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { buildRegistrationFlowJSON } from '../utils/flowConfig.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function main() {
  console.log('🚀 Generating WhatsApp Flow JSON...')
  
  // WhatsApp Flow
  const flowJSON = buildRegistrationFlowJSON()
  
  const outputPath = path.join(__dirname, '../../whatsapp_flow.json')
  fs.writeFileSync(outputPath, JSON.stringify(flowJSON, null, 2))
  
  console.log('✅ Success!')
  console.log(`📂 Saved to: ${path.resolve(outputPath)}`)
  console.log('\n--- JSON PREVIEW (REG_LOGIN Screen) ---')
  const loginScreen = flowJSON.screens.find(s => s.id === 'REG_LOGIN')
  console.log(JSON.stringify(loginScreen, null, 2))
}

main()
