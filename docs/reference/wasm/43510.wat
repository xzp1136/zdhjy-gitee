  (func (;43510;) (type 0) (param i32 i32) (result i32)
    (local i32 i32 i32)
    global.get 0
    i32.const 16
    i32.sub
    local.tee 4
    global.set 0
    i32.const 4366800
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3357344
      call 2180
      i32.const 3357576
      call 2180
      i32.const 3388080
      call 2180
      i32.const 3387256
      call 2180
      i32.const 3385852
      call 2180
      i32.const 3385832
      call 2180
      i32.const 3388084
      call 2180
      i32.const 4366800
      i32.const 1
      i32.store8
    end
    block  ;; label = @1
      block  ;; label = @2
        block  ;; label = @3
          local.get 0
          i32.load offset=8
          br_table 0 (;@3;) 1 (;@2;) 2 (;@1;)
        end
        local.get 0
        i64.const 1
        i64.store offset=8 align=4
        i32.const 1
        local.set 2
        br 1 (;@1;)
      end
      local.get 0
      i32.load offset=16
      local.set 3
      local.get 0
      i32.const -1
      i32.store offset=8
      i32.const 3357576
      i32.load
      local.tee 0
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 0
        call 60460
      end
      i32.const 4367470
      i32.load8_u
      i32.eqz
      if  ;; label = @2
        i32.const 3357576
        call 2180
        i32.const 4367470
        i32.const 1
        i32.store8
      end
      i32.const 3357576
      i32.load
      local.tee 0
      i32.load offset=116
      if (result i32)  ;; label = @2
        local.get 0
      else
        local.get 0
        call 60460
        i32.const 3357576
        i32.load
      end
      i32.load offset=92
      i32.load
      i32.load offset=60
      local.tee 1
      i32.load offset=12
      i32.const 0
      i32.le_s
      br_if 0 (;@1;)
      i32.const 0
      local.set 0
      block  ;; label = @2
        loop  ;; label = @3
          local.get 1
          local.get 0
          local.get 4
          i32.const 4
          i32.add
          i32.const 3388084
          i32.load
          call 50458
          local.get 4
          i32.load offset=4
          i32.load offset=12
          local.get 3
          i32.load offset=108
          i32.eq
          br_if 1 (;@2;)
          local.get 0
          i32.const 1
          i32.add
          local.tee 0
          local.get 1
          i32.load offset=12
          i32.lt_s
          br_if 0 (;@3;)
        end
        br 1 (;@1;)
      end
      local.get 1
      local.get 0
      local.get 4
      i32.const 8
      i32.add
      i32.const 3388084
      i32.load
      call 50458
      local.get 4
      i32.load offset=8
      local.tee 0
      i32.eqz
      br_if 0 (;@1;)
      local.get 0
      i32.load offset=28
      i32.eqz
      br_if 0 (;@1;)
      local.get 3
      i32.load offset=92
      local.tee 1
      i32.const 0
      i32.lt_s
      br_if 0 (;@1;)
      local.get 1
      local.get 3
      i32.load offset=84
      i32.load offset=12
      i32.ge_s
      br_if 0 (;@1;)
      local.get 0
      i32.load offset=20
      local.set 1
      i32.const 3357344
      i32.load
      local.tee 2
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 2
        call 60460
      end
      i32.const 4367474
      i32.load8_u
      i32.eqz
      if  ;; label = @2
        i32.const 3357344
        call 2180
        i32.const 4367474
        i32.const 1
        i32.store8
      end
      i32.const 3357344
      i32.load
      local.tee 2
      i32.load offset=116
      if (result i32)  ;; label = @2
        local.get 2
      else
        local.get 2
        call 60460
        i32.const 3357344
        i32.load
      end
      i32.load offset=92
      i32.load
      local.get 1
      i32.const 0
      call 44448
      local.set 1
      local.get 3
      i32.load offset=56
      local.get 3
      i32.load offset=92
      local.get 4
      i32.const 12
      i32.add
      i32.const 3385832
      i32.load
      call 50458
      local.get 3
      i32.load offset=72
      local.get 4
      i32.load offset=12
      i32.load offset=12
      i32.sub
      local.tee 3
      i32.const 0
      local.get 3
      i32.const 0
      i32.gt_s
      select
      local.get 1
      i32.gt_s
      if  ;; label = @2
        i32.const 0
        local.set 2
        i32.const 3357576
        i32.load
        local.tee 1
        i32.load offset=116
        i32.eqz
        if  ;; label = @3
          local.get 1
          call 60460
        end
        call 43410
        local.get 0
        i32.const 0
        call 41047
        br 1 (;@1;)
      end
      local.get 0
      i32.const 1
      i32.store8 offset=32
      i32.const 0
      local.set 2
      i32.const 3357576
      i32.load
      local.tee 0
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 0
        call 60460
      end
      call 43410
      i32.const 1
      i32.store8 offset=80
    end
    local.get 4
    i32.const 16
    i32.add
    global.set 0
    local.get 2)
