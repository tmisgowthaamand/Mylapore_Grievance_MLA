import { Router } from 'express'
import { db } from '../db.js'
import { buildRegistrationFlowJSON } from '../utils/flowConfig.js'
import { otpService } from '../services/otpService.js'

const router = Router()

/**
 * Handle WhatsApp Flow Data Exchange requests.
 * This is called by WhatsApp when a user interacts with the flow.
 */
router.post('/exchange', async (req, res) => {
  const { action, screen, data } = req.body
  console.log(`📱 Flow Action: ${action} on Screen: ${screen}`)

  try {
    // 1. Initial request (opening the flow)
    if (action === 'INIT') {
      return res.json({
        screen: 'REG_START',
        data: {
          has_error: false,
          error_text: '',
          init_phone: '',
          init_name: '',
          init_epic: ''
        }
      })
    }

    // 2. Data Exchange (button clicks with payload)
    if (action === 'data_exchange') {
      const payload = req.body.payload || {}
      
      // -- Action: lookup_epic --
      if (payload.action === 'lookup_epic') {
        const { epic_no } = payload
        // Simulation: If EPIC starts with 'TNA', find success
        if (epic_no && epic_no.startsWith('TNA')) {
          return res.json({
            screen: 'REG_CONFIRM',
            data: {
              voter_name: 'Chitra Mohan',
              epic_no: epic_no,
              relation_label: 'Husband',
              relation_name: 'Mohan',
              gender: 'Female',
              house_no: '42',
              assembly: 'Mylapore (25)',
              dob_label: '15-05-1990'
            }
          })
        }
        return res.json({
          screen: 'REG_START',
          data: { ...data, has_error: true, error_text: 'EPIC not found. Try manual registration.' }
        })
      }

      // -- Action: save_epic --
      if (payload.action === 'save_epic') {
        return res.json({
          screen: 'REG_DONE',
          data: {
            info_title: '🙏 Registered',
            info_body: 'You are now registered as a TVK member using your Voter ID.'
          }
        })
      }

      // -- Action: save_manual --
      if (payload.action === 'save_manual') {
        const { name, epic, email, gender } = payload
        const phone = (data && data.init_phone) || '919999999999'
        
        // Simulation: Create user in DB
        await db.createUser({
          name: name || 'Anonymous',
          phone,
          epic: epic || null,
          email: email || null,
          gender: gender || null,
          type: 'manual',
          area: 'Mylapore'
        })

        return res.json({
          screen: 'REG_DONE',
          data: {
            info_title: '🙏 Registered',
            info_body: 'Registration complete. Thank you for joining TVK.'
          }
        })
      }
    }

    // Default fallback
    res.status(400).json({ error: 'Unknown action' })
  } catch (err) {
    console.error('Flow Error:', err)
    res.status(500).json({ error: 'Flow processing failed' })
  }
})

export default router
