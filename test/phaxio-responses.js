module.exports = {
  faxStatus:{
    'success':true,
    'message':'Retrieved fax successfully',
    'data':{
      'id':23250797,
      'num_pages':1,
      'cost':7,
      'direction':'sent',
      'status':'success',
      'is_test':true,
      'requested_at':1458419092,
      'completed_at':1458419095,
      'recipients':[
        {
          'number':'+19175551212',
          'status':'success',
          'bitrate':'14400',
          'resolution':'7700',
          'completed_at':1458419095
        }
      ]
    }
  },
  faxStatusFailed: {
    'success': false,
    'message': 'Fax with this ID does not exist'
  },
  faxCancel: {
    'success': true,
    'data':'Fax canceled successfully.'
  },
  fireBatch: {
    'success': true,
    'data': 'Who can tell?'
  },
  closeBatch: {
    'success': true,
    'data': 'Who can tell?'
  },
  'provisionNumber': {
    'success':true,
    'message':'Number provisioned successfully!',
    'data':{
      'number': '8475551234',
      'city': 'Northbrook',
      'state': 'Illinois',
      'cost': 200,
      'last_billed_at': '2013-11-12 11:39:05',
      'provisioned_at': '2013-11-12 11:39:05'
    }
  },
  'provisionNumberFailed': {
    'success': false,
    'message': 'The area code you chose is invalid or has no numbers at this time.'
  },
  accountStatus: {
    'success':true,
    'message':'Account status retrieved successfully',
    'data': {
      'faxes_sent_this_month':0,
      'faxes_sent_today':0,
      'balance':'93'
    }
  },
  send: {'success':true,'message':'Fax queued for sending','faxId':23261516,'data':{'faxId':23261516}}
};
