import { loadAccountDataFromLocalStorage } from 'modules/auth/actions/load-account-data-from-local-storage'
import { updateAssets } from 'modules/auth/actions/update-assets'
import { updateLoginAccount } from 'modules/auth/actions/update-login-account'
import { loadAccountPositions } from 'modules/my-positions/actions/load-account-positions'
import { checkAccountAllowance } from 'modules/auth/actions/approve-account'

import getValue from 'utils/get-value'
import logError from 'utils/log-error'

export const loadAccountData = (account, callback = logError) => (dispatch) => {
  const address = getValue(account, 'address')
  if (!address) return callback('account address required')
  dispatch(loadAccountDataFromLocalStorage(account.address))
  dispatch(updateLoginAccount(account))
  dispatch(loadAccountPositions())
  dispatch(updateAssets())
  dispatch(checkAccountAllowance())
}
