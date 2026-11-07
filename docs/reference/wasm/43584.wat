  (func (;43584;) (type 7) (param i32 i32 i32 i32 i32)
    (local i32 i32 i32 i32 i64 i64)
    global.get 0
    i32.const 48
    i32.sub
    local.tee 5
    global.set 0
    i32.const 4366851
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3376288
      call 2180
      i32.const 3408376
      call 2180
      i32.const 3359256
      call 2180
      i32.const 3387144
      call 2180
      i32.const 3387224
      call 2180
      i32.const 3387256
      call 2180
      i32.const 3389756
      call 2180
      i32.const 3360788
      call 2180
      i32.const 3415776
      call 2180
      i32.const 4366851
      i32.const 1
      i32.store8
    end
    local.get 5
    i32.const 0
    i32.store offset=40
    local.get 0
    i32.load offset=64
    local.set 4
    block  ;; label = @1
      local.get 2
      local.get 0
      i32.load offset=48
      i32.ne
      if  ;; label = @2
        local.get 1
        local.get 4
        i32.ne
        br_if 1 (;@1;)
        local.get 0
        local.get 0
        i32.load offset=72
        i32.const 1
        i32.sub
        local.tee 1
        i32.const 0
        local.get 1
        i32.const 0
        i32.gt_s
        local.tee 1
        select
        i32.store offset=72
        local.get 0
        i32.load offset=68
        i32.const 0
        i32.gt_s
        br_if 1 (;@1;)
        local.get 0
        local.get 1
        if (result i32)  ;; label = @3
          i32.const 1
        else
          local.get 0
          i32.const 0
          i32.store offset=64
          i32.const 0
        end
        i32.store8 offset=52
        br 1 (;@1;)
      end
      local.get 1
      local.get 4
      i32.ne
      br_if 0 (;@1;)
      local.get 0
      local.get 0
      i32.load offset=72
      i32.const 1
      i32.sub
      local.tee 2
      i32.const 0
      local.get 2
      i32.const 0
      i32.gt_s
      select
      i32.store offset=72
      i32.const 4367473
      i32.load8_u
      i32.eqz
      if  ;; label = @2
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
      local.set 2
      i32.const 4367477
      i32.load8_u
      i32.eqz
      if  ;; label = @2
        i32.const 3360984
        call 2180
        i32.const 4367477
        i32.const 1
        i32.store8
      end
      local.get 2
      i32.const 3360984
      i32.load
      i32.load offset=92
      i32.load
      i32.load offset=72
      local.get 0
      i32.const 0
      call 48735
      i32.const 5
      i32.const 0
      call 43865
      local.set 2
      i32.const 3360788
      i32.load
      local.tee 4
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 4
        call 60460
      end
      local.get 2
      i32.const 0
      i32.const 0
      call 48872
      if  ;; label = @2
        local.get 0
        i32.load offset=64
        local.get 1
        i32.ne
        br_if 1 (;@1;)
        local.get 0
        local.get 0
        i32.load offset=72
        i32.const 1
        i32.sub
        local.tee 1
        i32.const 0
        local.get 1
        i32.const 0
        i32.gt_s
        local.tee 1
        select
        i32.store offset=72
        local.get 0
        i32.load offset=68
        i32.const 0
        i32.gt_s
        br_if 1 (;@1;)
        local.get 0
        local.get 1
        if (result i32)  ;; label = @3
          i32.const 1
        else
          local.get 0
          i32.const 0
          i32.store offset=64
          i32.const 0
        end
        i32.store8 offset=52
        br 1 (;@1;)
      end
      i32.const 3359256
      i32.load
      local.tee 4
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 4
        call 60460
        i32.const 3359256
        i32.load
        local.set 4
      end
      i32.const 3376288
      i32.load
      local.set 6
      local.get 4
      i32.load offset=92
      i32.load
      local.set 4
      local.get 5
      local.get 1
      i32.store offset=44
      local.get 4
      local.get 5
      i32.const 44
      i32.add
      local.get 5
      i32.const 40
      i32.add
      local.get 6
      call 34286
      i32.eqz
      if  ;; label = @2
        i32.const 4367473
        i32.load8_u
        i32.eqz
        if  ;; label = @3
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
        local.get 2
        i32.const 0
        call 43866
        local.get 0
        i32.load offset=64
        local.get 1
        i32.ne
        br_if 1 (;@1;)
        local.get 0
        local.get 0
        i32.load offset=72
        i32.const 1
        i32.sub
        local.tee 1
        i32.const 0
        local.get 1
        i32.const 0
        i32.gt_s
        local.tee 1
        select
        i32.store offset=72
        local.get 0
        i32.load offset=68
        i32.const 0
        i32.gt_s
        br_if 1 (;@1;)
        local.get 0
        local.get 1
        if (result i32)  ;; label = @3
          i32.const 1
        else
          local.get 0
          i32.const 0
          i32.store offset=64
          i32.const 0
        end
        i32.store8 offset=52
        br 1 (;@1;)
      end
      local.get 2
      i32.const 0
      call 48828
      local.set 4
      i32.const 4377529
      i32.load8_u
      i32.eqz
      if  ;; label = @2
        i32.const 3361564
        call 2180
        i32.const 4377529
        i32.const 1
        i32.store8
      end
      i32.const 3361564
      i32.load
      i32.load offset=92
      local.tee 6
      i64.load align=4
      local.set 9
      local.get 5
      local.get 6
      i64.load offset=8 align=4
      local.tee 10
      i64.store offset=16
      local.get 5
      local.get 10
      i64.store offset=32
      local.get 5
      local.get 9
      i64.store offset=24
      local.get 5
      local.get 9
      i64.store offset=8
      local.get 4
      local.get 5
      i32.const 8
      i32.add
      i32.const 0
      call 49482
      local.get 5
      i32.load offset=40
      i32.load offset=16
      i32.const 0
      local.get 5
      i32.const 44
      i32.add
      i32.const 3389756
      i32.load
      call 50458
      local.get 5
      i32.load offset=44
      local.set 6
      local.get 2
      local.get 5
      i32.const 44
      i32.add
      i32.const 3408376
      i32.load
      call 45432
      local.get 5
      i32.load offset=44
      local.set 4
      i32.const 3360788
      i32.load
      local.tee 7
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 7
        call 60460
      end
      block  ;; label = @2
        local.get 4
        i32.const 0
        i32.const 0
        call 48812
        i32.eqz
        br_if 0 (;@2;)
        i32.const 0
        call 56067
        i32.load offset=264
        local.get 6
        i32.const 0
        call 48049
        i32.const 3415776
        i32.load
        call 24700
        local.set 7
        i32.const 3360788
        i32.load
        local.tee 8
        i32.load offset=116
        i32.eqz
        if  ;; label = @3
          local.get 8
          call 60460
        end
        local.get 7
        i32.const 0
        i32.const 0
        call 48812
        i32.eqz
        br_if 0 (;@2;)
        local.get 4
        local.get 7
        i32.const 0
        call 20479
        local.get 4
        local.get 4
        i32.load
        local.tee 7
        i32.load offset=556
        local.get 7
        i32.load offset=552
        call_indirect (type 1)
      end
      local.get 0
      i32.load offset=76
      local.get 2
      i32.const 3387224
      i32.load
      call 50463
      local.get 0
      i32.load offset=80
      local.get 3
      i32.const 3387144
      i32.load
      call 50463
      local.get 0
      local.get 0
      i32.load offset=76
      i32.load offset=12
      i32.store offset=68
      local.get 0
      local.get 6
      i32.store offset=88
      local.get 0
      local.get 1
      i32.store offset=40
      local.get 0
      i32.const 1
      i32.store8 offset=85
      local.get 0
      i32.const 0
      i32.store8 offset=52
      local.get 0
      local.get 0
      call 43585
      i32.const 4367476
      i32.load8_u
      i32.eqz
      if  ;; label = @2
        i32.const 3361216
        call 2180
        i32.const 4367476
        i32.const 1
        i32.store8
      end
      block  ;; label = @2
        i32.const 3361216
        i32.load
        i32.load offset=92
        i32.load
        local.tee 2
        i32.eqz
        br_if 0 (;@2;)
        local.get 2
        local.get 0
        call 43525
        i32.const 4367476
        i32.load8_u
        br_if 0 (;@2;)
        i32.const 3361216
        call 2180
        i32.const 4367476
        i32.const 1
        i32.store8
      end
      i32.const 3361216
      i32.load
      i32.load offset=92
      i32.load
      local.tee 2
      if  ;; label = @2
        local.get 2
        local.get 0
        call 43412
      end
      local.get 0
      i32.load offset=68
      local.get 0
      i32.load offset=60
      i32.lt_s
      br_if 0 (;@1;)
      i32.const 4367476
      i32.load8_u
      i32.eqz
      if  ;; label = @2
        i32.const 3361216
        call 2180
        i32.const 4367476
        i32.const 1
        i32.store8
      end
      i32.const 3361216
      i32.load
      i32.load offset=92
      i32.load
      local.tee 2
      i32.eqz
      br_if 0 (;@1;)
      local.get 2
      local.get 0
      local.get 1
      local.get 0
      call 43551
    end
    local.get 5
    i32.const 48
    i32.add
    global.set 0)
