import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { fetchAnalyticsOverview } from '../store/analyticsSlice.js';

export function useAnalytics(dateRange) {
  const dispatch = useDispatch();
  const analytics = useSelector((state) => state.analytics || {});

  useEffect(() => {
    if (dateRange) {
      dispatch(fetchAnalyticsOverview(dateRange));
    }
  }, [dispatch, dateRange]);

  return analytics;
}

export default useAnalytics;
