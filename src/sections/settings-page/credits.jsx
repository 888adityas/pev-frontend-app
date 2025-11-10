import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';

import { CONFIG } from 'src/config-global';
import { fetchCreditStats } from 'src/redux/slice/creditSlice';

import { CreditTable } from 'src/sections/dashboard copy/component/table/credit-table';

import CreditStatsCards from '../dashboard/component/stats-cards/credit-stats-cards';

// ----------------------------------------------------------------------

const metadata = { title: `Credits | ${CONFIG.site.name}` };

export default function ThreePage() {
  const dispatch = useDispatch();

  // Credit Statistics from redux store
  const { credit_stats } = useSelector((state) => state.creditStats);

  // Load Dashboard Data
  useEffect(() => {
    // fetch Dashboard credits statistics
    dispatch(fetchCreditStats());
  }, [dispatch]);

  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <CreditStatsCards credit_stats={credit_stats} />

      <CreditTable />
    </>
  );
}
