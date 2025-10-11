import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useMarketDataSync = () => {
  const queryClient = useQueryClient();

  // Check if we have recent data (within last hour)
  const { data: hasRecentData, isLoading: checkingData } = useQuery({
    queryKey: ['market-data-health'],
    queryFn: async () => {
      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);

      const { data, error } = await supabase
        .from('market_prices')
        .select('id')
        .gte('recorded_at', oneHourAgo.toISOString())
        .limit(1);

      if (error) throw error;
      return data && data.length > 0;
    },
    refetchInterval: 60000, // Check every minute
  });

  // Sync market data
  const syncMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('sync-market-data');
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || '✨ ข้อมูลตลาดอัพเดทเรียบร้อย!');
      // Invalidate all market-related queries
      queryClient.invalidateQueries({ queryKey: ['realtime-latest'] });
      queryClient.invalidateQueries({ queryKey: ['monthly-data'] });
      queryClient.invalidateQueries({ queryKey: ['yearly-data'] });
      queryClient.invalidateQueries({ queryKey: ['trend-data'] });
      queryClient.invalidateQueries({ queryKey: ['market-data-health'] });
    },
    onError: (error) => {
      console.error('Sync error:', error);
      toast.error('ไม่สามารถอัพเดทข้อมูลได้ กรุณาลองใหม่');
    },
  });

  // Auto-sync if no recent data
  const triggerAutoSync = () => {
    if (!hasRecentData && !syncMutation.isPending && !checkingData) {
      console.log('🔄 Auto-triggering data sync...');
      syncMutation.mutate();
    }
  };

  return {
    hasRecentData,
    checkingData,
    syncMarketData: syncMutation.mutate,
    isSyncing: syncMutation.isPending,
    syncStatus: syncMutation.status,
    triggerAutoSync,
  };
};
