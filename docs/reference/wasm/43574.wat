  (func (;43574;) (type 1) (param i32 i32)
    (local i32 i32 i32 i32)
    global.get 0
    i32.const 16
    i32.sub
    local.tee 3
    global.set 0
    i32.const 4366855
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3408372
      call 2180
      i32.const 3408376
      call 2180
      i32.const 3387228
      call 2180
      i32.const 3387148
      call 2180
      i32.const 3387256
      call 2180
      i32.const 3387260
      call 2180
      i32.const 3360788
      call 2180
      i32.const 3434324
      call 2180
      i32.const 4366855
      i32.const 1
      i32.store8
    end
    local.get 0
    i32.load offset=76
    local.tee 1
    i32.load offset=12
    i32.const 0
    i32.gt_s
    if  ;; label = @1
      loop  ;; label = @2
        local.get 1
        local.get 2
        local.get 3
        i32.const 4
        i32.add
        i32.const 3387260
        i32.load
        call 50458
        local.get 3
        i32.load offset=4
        local.set 1
        i32.const 3360788
        i32.load
        local.tee 4
        i32.load offset=116
        i32.eqz
        if  ;; label = @3
          local.get 4
          call 60460
        end
        local.get 1
        i32.const 0
        i32.const 0
        call 48872
        i32.eqz
        if  ;; label = @3
          local.get 1
          local.get 3
          i32.const 8
          i32.add
          i32.const 3408376
          i32.load
          call 45432
          local.get 3
          i32.load offset=8
          local.set 4
          i32.const 3360788
          i32.load
          local.tee 5
          i32.load offset=116
          i32.eqz
          if  ;; label = @4
            local.get 5
            call 60460
          end
          local.get 4
          i32.const 0
          i32.const 0
          call 48812
          if  ;; label = @4
            local.get 4
            i32.const 0
            i32.const 0
            call 20479
          end
          local.get 1
          local.get 3
          i32.const 12
          i32.add
          i32.const 3408372
          i32.load
          call 45432
          local.get 3
          i32.load offset=12
          local.set 4
          i32.const 3360788
          i32.load
          local.tee 5
          i32.load offset=116
          i32.eqz
          if  ;; label = @4
            local.get 5
            call 60460
          end
          local.get 4
          i32.const 0
          i32.const 0
          call 48812
          if  ;; label = @4
            local.get 4
            i32.const 0
            i32.const 0
            call 48707
          end
          local.get 1
          i32.const 0
          call 48828
          i32.const 0
          i32.const 0
          call 7821
          drop
          i32.const 4367473
          i32.load8_u
          i32.eqz
          if  ;; label = @4
            i32.const 3360844
            call 2180
            i32.const 4367473
            i32.const 1
            i32.store8
          end
          i32.const 3360844
          i32.load
          i32.load offset=92
          i32.load
          local.get 1
          i32.const 0
          call 43866
        end
        local.get 2
        i32.const 1
        i32.add
        local.tee 2
        local.get 0
        i32.load offset=76
        local.tee 1
        i32.load offset=12
        i32.lt_s
        br_if 0 (;@2;)
      end
    end
    i32.const 3387228
    i32.load
    local.set 2
    local.get 1
    local.get 1
    i32.load offset=16
    i32.const 1
    i32.add
    i32.store offset=16
    block  ;; label = @1
      local.get 2
      i32.load offset=16
      i32.load offset=96
      i32.load offset=100
      call 2224
      if  ;; label = @2
        local.get 1
        i32.load offset=12
        local.set 2
        local.get 1
        i32.const 0
        i32.store offset=12
        local.get 2
        i32.const 0
        i32.le_s
        br_if 1 (;@1;)
        local.get 1
        i32.load offset=8
        i32.const 0
        local.get 2
        i32.const 0
        call 54070
        br 1 (;@1;)
      end
      local.get 1
      i32.const 0
      i32.store offset=12
    end
    i32.const 3387148
    i32.load
    local.set 2
    local.get 0
    i32.load offset=80
    local.tee 1
    local.get 1
    i32.load offset=16
    i32.const 1
    i32.add
    i32.store offset=16
    block  ;; label = @1
      local.get 2
      i32.load offset=16
      i32.load offset=96
      i32.load offset=100
      call 2224
      if  ;; label = @2
        local.get 1
        i32.load offset=12
        local.set 2
        local.get 1
        i32.const 0
        i32.store offset=12
        local.get 2
        i32.const 0
        i32.le_s
        br_if 1 (;@1;)
        local.get 1
        i32.load offset=8
        i32.const 0
        local.get 2
        i32.const 0
        call 54070
        br 1 (;@1;)
      end
      local.get 1
      i32.const 0
      i32.store offset=12
    end
    local.get 0
    i32.const 0
    i32.store offset=72
    local.get 0
    i64.const 0
    i64.store offset=64 align=4
    local.get 0
    i32.const 0
    i32.store8 offset=85
    local.get 0
    i32.const 0
    i32.store offset=40
    local.get 0
    i32.const 0
    i32.store8 offset=52
    local.get 0
    i32.const 3434324
    i32.load
    i32.store offset=88
    local.get 3
    i32.const 16
    i32.add
    global.set 0)
