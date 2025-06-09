"use client";

import { motion } from "framer-motion";
import { X, Gift, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface RewardsShopProps {
  coins: number;
  onClose: () => void;
  onPurchase: (cost: number) => void;
}

const rewards = [
  {
    id: "1",
    name: "Satire Meme Feed",
    description: "Unlock a curated feed of content-related memes",
    cost: 100,
  },
  {
    id: "2",
    name: "Extended Break",
    description: "Take an extra 15-minute break",
    cost: 50,
  },
  {
    id: "3",
    name: "Custom Theme",
    description: "Unlock custom color themes for your dashboard",
    cost: 200,
  },
];

export function RewardsShop({ coins, onClose, onPurchase }: RewardsShopProps) {
  const { toast } = useToast();

  const handlePurchase = (cost: number) => {
    if (coins >= cost) {
      onPurchase(cost);
      toast({
        title: "Reward Purchased",
        description: "You've successfully redeemed this reward!",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="relative mx-auto w-full max-w-lg rounded-lg bg-card p-6 shadow-lg"
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold">Rewards Shop</h2>
          <p className="text-muted-foreground">
            You have {coins} coins to spend
          </p>
        </div>

        <div className="grid gap-4">
          {rewards.map((reward) => (
            <Card key={reward.id} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium">{reward.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {reward.description}
                  </p>
                </div>
                <Badge variant="secondary" className="gap-1">
                  <Gift className="h-3 w-3" />
                  {reward.cost}
                </Badge>
              </div>
              <Button
                className="mt-4 w-full"
                onClick={() => handlePurchase(reward.cost)}
                disabled={coins < reward.cost}
              >
                {coins < reward.cost ? (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Locked
                  </>
                ) : (
                  "Redeem"
                )}
              </Button>
            </Card>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
