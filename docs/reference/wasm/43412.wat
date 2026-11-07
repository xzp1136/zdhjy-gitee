  (func (;43412;) (type 1) (param i32 i32)
    (local i32 i32 i32 i32)
    global.get 0
    i32.const 16
    i32.sub
    local.tee 3
    global.set 0
    i32.const 4366810
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3356428
      call 2180
      i32.const 3357576
      call 2180
      i32.const 3388632
      call 2180
      i32.const 3388636
      call 2180
      i32.const 3360788
      call 2180
      i32.const 3364328
      call 2180
      i32.const 3480976
      call 2180
      i32.const 3481484
      call 2180
      i32.const 4366810
      i32.const 1
      i32.store8
    end
    block  ;; label = @1
      local.get 0
      i32.load8_u offset=56
      br_if 0 (;@1;)
      local.get 0
      i32.load offset=32
      local.tee 2
      i32.load offset=12
      i32.const 0
      i32.gt_s
      if  ;; label = @2
        i32.const 0
        local.set 1
        loop  ;; label = @3
          local.get 2
          local.get 1
          local.get 3
          i32.const 12
          i32.add
          i32.const 3388636
          i32.load
          call 50458
          local.get 3
          i32.load offset=12
          local.set 2
          i32.const 3360788
          i32.load
          local.tee 5
          i32.load offset=116
          i32.eqz
          if  ;; label = @4
            local.get 5
            call 60460
          end
          block  ;; label = @4
            local.get 2
            i32.const 0
            i32.const 0
            call 48872
            br_if 0 (;@4;)
            local.get 2
            i32.load8_u offset=84
            i32.eqz
            br_if 0 (;@4;)
            local.get 2
            i32.load8_u offset=85
            i32.eqz
            br_if 0 (;@4;)
            local.get 4
            local.get 2
            i32.load8_u offset=52
            i32.const 1
            i32.xor
            i32.add
            local.set 4
          end
          local.get 1
          i32.const 1
          i32.add
          local.tee 1
          local.get 0
          i32.load offset=32
          local.tee 2
          i32.load offset=12
          i32.lt_s
          br_if 0 (;@3;)
        end
      end
      local.get 4
      local.get 0
      i32.load offset=24
      i32.lt_s
      br_if 0 (;@1;)
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
      i32.const 3360984
      i32.load
      i32.load offset=92
      i32.load
      local.set 1
      i32.const 3360788
      i32.load
      local.tee 2
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 2
        call 60460
      end
      block  ;; label = @2
        local.get 1
        i32.const 0
        i32.const 0
        call 48812
        i32.eqz
        br_if 0 (;@2;)
        i32.const 4367477
        i32.load8_u
        i32.eqz
        if  ;; label = @3
          i32.const 3360984
          call 2180
          i32.const 4367477
          i32.const 1
          i32.store8
        end
        i32.const 3360984
        i32.load
        i32.load offset=92
        i32.load
        local.get 1
        call 43425
        i32.eqz
        br_if 0 (;@2;)
        i32.const 3356428
        i32.load
        local.tee 1
        i32.load offset=116
        i32.eqz
        if  ;; label = @3
          local.get 1
          call 60460
        end
        i32.const 3480976
        i32.load
        i32.const 0
        call 55817
        br 1 (;@1;)
      end
      i32.const 3356428
      i32.load
      local.tee 1
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 1
        call 60460
      end
      i32.const 3481484
      i32.load
      i32.const 0
      call 55817
      local.get 0
      i32.const 1
      i32.store8 offset=56
      i32.const 3357576
      i32.load
      local.tee 1
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 1
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
      local.tee 1
      i32.load offset=116
      if (result i32)  ;; label = @2
        local.get 1
      else
        local.get 1
        call 60460
        i32.const 3357576
        i32.load
      end
      i32.load offset=92
      i32.load
      i32.const 2
      i32.store offset=16
      i32.const 3364328
      i32.load
      local.tee 1
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 1
        call 60460
      end
      i32.const 4367475
      i32.load8_u
      i32.eqz
      if  ;; label = @2
        i32.const 3364328
        call 2180
        i32.const 4367475
        i32.const 1
        i32.store8
      end
      i32.const 3364328
      i32.load
      local.tee 1
      i32.load offset=116
      if (result i32)  ;; label = @2
        local.get 1
      else
        local.get 1
        call 60460
        i32.const 3364328
        i32.load
      end
      i32.load offset=92
      i32.load
      i32.const 1
      i32.const 0
      call 43187
    end
    local.get 3
    i32.const 16
    i32.add
    global.set 0)
